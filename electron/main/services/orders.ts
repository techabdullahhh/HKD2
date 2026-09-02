import type Database from "better-sqlite3";
import type {
  DealChoiceSnapshotEntry,
  Order,
  OrderItem,
  OrderItemInput,
  OrderStatus,
  PaymentMethod
} from "../../../shared/types";
import { computeBusinessDate } from "./businessDate";
import { getProductVariant, listDeals } from "./catalog";
import { getSettings } from "./settings";

interface ResolvedItem {
  itemType: "product" | "deal";
  productId: number | null;
  variantId: number | null;
  dealId: number | null;
  nameSnapshot: string;
  variantSnapshot: string | null;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  notes: string | null;
  dealChoicesSnapshot: DealChoiceSnapshotEntry[] | null;
}

class OrderValidationError extends Error {}

function resolveItem(db: Database.Database, input: OrderItemInput): ResolvedItem {
  if (input.quantity < 1 || !Number.isInteger(input.quantity)) {
    throw new OrderValidationError("Quantity must be a positive integer");
  }

  if (input.itemType === "product") {
    if (!input.productId || !input.variantId) throw new OrderValidationError("Missing productId/variantId");
    const found = getProductVariant(db, input.productId, input.variantId);
    if (!found) throw new OrderValidationError("Unknown product/variant");
    const unitPrice = found.variant.price;
    return {
      itemType: "product",
      productId: input.productId,
      variantId: input.variantId,
      dealId: null,
      nameSnapshot: found.product.name,
      variantSnapshot: found.variant.variant_name,
      unitPriceSnapshot: unitPrice,
      quantity: input.quantity,
      lineTotal: unitPrice * input.quantity,
      notes: input.notes ?? null,
      dealChoicesSnapshot: null
    };
  }

  // deal
  if (!input.dealId) throw new OrderValidationError("Missing dealId");
  const deal = listDeals(db, true).find((d) => d.id === input.dealId);
  if (!deal) throw new OrderValidationError("Unknown deal");

  const choices = input.dealChoices ?? [];
  const snapshot: DealChoiceSnapshotEntry[] = [];

  for (const slot of deal.slots) {
    if (slot.kind === "fixed") {
      if (!slot.fixedProductId || !slot.fixedVariantId) throw new OrderValidationError("Deal slot misconfigured");
      const found = getProductVariant(db, slot.fixedProductId, slot.fixedVariantId);
      if (!found) throw new OrderValidationError("Deal fixed item no longer exists");
      snapshot.push({
        label: slot.quantity > 1 ? `${slot.quantity}x ${slot.label}` : slot.label,
        productName: found.product.name,
        variantName: found.variant.variant_name
      });
    } else {
      const choice = choices.find((c) => c.slotId === slot.id);
      if (!choice) throw new OrderValidationError(`Missing selection for "${slot.label}"`);
      const found = getProductVariant(db, choice.productId, choice.variantId);
      if (!found) throw new OrderValidationError(`Invalid selection for "${slot.label}"`);
      if (slot.choiceCategoryIds && !slot.choiceCategoryIds.includes(found.product.category_id)) {
        throw new OrderValidationError(`Selection for "${slot.label}" is not an eligible product`);
      }
      if (slot.choiceVariantName && found.variant.variant_name !== slot.choiceVariantName) {
        throw new OrderValidationError(`"${slot.label}" must be ${slot.choiceVariantName}`);
      }
      snapshot.push({ label: slot.label, productName: found.product.name, variantName: found.variant.variant_name });
    }
  }

  return {
    itemType: "deal",
    productId: null,
    variantId: null,
    dealId: deal.id,
    nameSnapshot: deal.name,
    variantSnapshot: null,
    unitPriceSnapshot: deal.price,
    quantity: input.quantity,
    lineTotal: deal.price * input.quantity,
    notes: input.notes ?? null,
    dealChoicesSnapshot: snapshot
  };
}

function insertOrderItems(db: Database.Database, orderId: number, items: ResolvedItem[]): void {
  const stmt = db.prepare(
    `INSERT INTO order_items
      (order_id, item_type, product_id, variant_id, deal_id, name_snapshot, variant_snapshot, unit_price_snapshot, quantity, line_total, notes, deal_choices_snapshot)
     VALUES (@orderId, @itemType, @productId, @variantId, @dealId, @nameSnapshot, @variantSnapshot, @unitPriceSnapshot, @quantity, @lineTotal, @notes, @dealChoicesSnapshot)`
  );
  for (const item of items) {
    stmt.run({
      orderId,
      itemType: item.itemType,
      productId: item.productId,
      variantId: item.variantId,
      dealId: item.dealId,
      nameSnapshot: item.nameSnapshot,
      variantSnapshot: item.variantSnapshot,
      unitPriceSnapshot: item.unitPriceSnapshot,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      notes: item.notes,
      dealChoicesSnapshot: item.dealChoicesSnapshot ? JSON.stringify(item.dealChoicesSnapshot) : null
    });
  }
}

function formatOrderNumber(id: number): string {
  return `HKD-${String(id).padStart(6, "0")}`;
}

export function createHeldOrder(
  db: Database.Database,
  params: { employeeSessionId: number; userId: number; items: OrderItemInput[] }
): Order {
  const resolved = params.items.map((i) => resolveItem(db, i));
  const subtotal = resolved.reduce((sum, i) => sum + i.lineTotal, 0);
  const settings = getSettings(db);
  const businessDate = computeBusinessDate(new Date(), settings.businessDayStartHour);

  const tx = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO orders (employee_session_id, user_id, business_date, subtotal, status)
         VALUES (?, ?, ?, ?, 'held')`
      )
      .run(params.employeeSessionId, params.userId, businessDate, subtotal);
    const orderId = result.lastInsertRowid as number;
    db.prepare("UPDATE orders SET order_number = ? WHERE id = ?").run(formatOrderNumber(orderId), orderId);
    insertOrderItems(db, orderId, resolved);
    return orderId;
  });

  const orderId = tx();
  return getOrderById(db, orderId)!;
}

export function checkoutOrder(
  db: Database.Database,
  params: {
    orderId?: number; // if resuming a held order
    employeeSessionId: number;
    userId: number;
    items?: OrderItemInput[]; // if checking out a fresh cart directly
    paymentMethod: PaymentMethod;
    amountTendered?: number;
  }
): Order {
  const settings = getSettings(db);
  const serviceCharge = settings.serviceChargeDefault;

  const tx = db.transaction(() => {
    let orderId: number;
    let subtotal: number;

    if (params.orderId) {
      const existing = db.prepare("SELECT * FROM orders WHERE id = ?").get(params.orderId) as
        | { id: number; subtotal: number; status: OrderStatus }
        | undefined;
      if (!existing) throw new OrderValidationError("Order not found");
      if (existing.status !== "held") throw new OrderValidationError("Order is not held");
      orderId = existing.id;
      subtotal = existing.subtotal;
    } else {
      const resolved = (params.items ?? []).map((i) => resolveItem(db, i));
      subtotal = resolved.reduce((sum, i) => sum + i.lineTotal, 0);
      const businessDate = computeBusinessDate(new Date(), settings.businessDayStartHour);
      const result = db
        .prepare(
          `INSERT INTO orders (employee_session_id, user_id, business_date, subtotal, status)
           VALUES (?, ?, ?, ?, 'held')`
        )
        .run(params.employeeSessionId, params.userId, businessDate, subtotal);
      orderId = result.lastInsertRowid as number;
      db.prepare("UPDATE orders SET order_number = ? WHERE id = ?").run(formatOrderNumber(orderId), orderId);
      insertOrderItems(db, orderId, resolved);
    }

    const grandTotal = subtotal + serviceCharge;
    db.prepare(
      `UPDATE orders SET
        status = 'completed',
        service_charge = ?,
        grand_total = ?,
        payment_method = ?,
        amount_tendered = ?,
        completed_at = datetime('now')
       WHERE id = ?`
    ).run(serviceCharge, grandTotal, params.paymentMethod, params.amountTendered ?? null, orderId);

    return orderId;
  });

  const orderId = tx();
  return getOrderById(db, orderId)!;
}

export function cancelOrder(db: Database.Database, orderId: number, reason: string): Order {
  db.prepare("UPDATE orders SET status = 'cancelled', cancelled_reason = ? WHERE id = ?").run(reason, orderId);
  return getOrderById(db, orderId)!;
}

interface OrderRow {
  id: number;
  order_number: string;
  employee_session_id: number;
  user_id: number;
  business_date: string;
  subtotal: number;
  service_charge: number | null;
  grand_total: number | null;
  payment_method: PaymentMethod | null;
  amount_tendered: number | null;
  status: OrderStatus;
  created_at: string;
  completed_at: string | null;
  cancelled_reason: string | null;
}

interface OrderItemRow {
  id: number;
  order_id: number;
  item_type: "product" | "deal";
  product_id: number | null;
  variant_id: number | null;
  deal_id: number | null;
  name_snapshot: string;
  variant_snapshot: string | null;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  notes: string | null;
  deal_choices_snapshot: string | null;
}

function toOrder(db: Database.Database, row: OrderRow): Order {
  const userRow = db.prepare("SELECT full_name FROM users WHERE id = ?").get(row.user_id) as { full_name: string };
  const itemRows = db.prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id").all(row.id) as OrderItemRow[];
  const items: OrderItem[] = itemRows.map((i) => ({
    id: i.id,
    orderId: i.order_id,
    itemType: i.item_type,
    productId: i.product_id,
    variantId: i.variant_id,
    dealId: i.deal_id,
    nameSnapshot: i.name_snapshot,
    variantSnapshot: i.variant_snapshot,
    unitPriceSnapshot: i.unit_price_snapshot,
    quantity: i.quantity,
    lineTotal: i.line_total,
    notes: i.notes,
    dealChoicesSnapshot: i.deal_choices_snapshot ? JSON.parse(i.deal_choices_snapshot) : null
  }));
  return {
    id: row.id,
    orderNumber: row.order_number,
    employeeSessionId: row.employee_session_id,
    userId: row.user_id,
    employeeName: userRow?.full_name ?? "Unknown",
    businessDate: row.business_date,
    subtotal: row.subtotal,
    serviceCharge: row.service_charge ?? 0,
    grandTotal: row.grand_total ?? row.subtotal,
    paymentMethod: row.payment_method,
    amountTendered: row.amount_tendered,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    cancelledReason: row.cancelled_reason,
    items
  };
}

export function getOrderById(db: Database.Database, orderId: number): Order | null {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as OrderRow | undefined;
  return row ? toOrder(db, row) : null;
}

export function listHeldOrders(db: Database.Database, userId?: number): Order[] {
  const rows = userId
    ? (db.prepare("SELECT * FROM orders WHERE status = 'held' AND user_id = ? ORDER BY created_at DESC").all(userId) as OrderRow[])
    : (db.prepare("SELECT * FROM orders WHERE status = 'held' ORDER BY created_at DESC").all() as OrderRow[]);
  return rows.map((r) => toOrder(db, r));
}

export interface OrderFilter {
  businessDateFrom?: string;
  businessDateTo?: string;
  employeeSessionId?: number;
  userId?: number;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
}

export function listOrders(db: Database.Database, filter: OrderFilter = {}): Order[] {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filter.businessDateFrom) {
    clauses.push("business_date >= ?");
    params.push(filter.businessDateFrom);
  }
  if (filter.businessDateTo) {
    clauses.push("business_date <= ?");
    params.push(filter.businessDateTo);
  }
  if (filter.employeeSessionId) {
    clauses.push("employee_session_id = ?");
    params.push(filter.employeeSessionId);
  }
  if (filter.userId) {
    clauses.push("user_id = ?");
    params.push(filter.userId);
  }
  if (filter.status) {
    clauses.push("status = ?");
    params.push(filter.status);
  }
  if (filter.paymentMethod) {
    clauses.push("payment_method = ?");
    params.push(filter.paymentMethod);
  }
  if (filter.search) {
    clauses.push("order_number LIKE ?");
    params.push(`%${filter.search}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db.prepare(`SELECT * FROM orders ${where} ORDER BY id DESC`).all(...params) as OrderRow[];
  return rows.map((r) => toOrder(db, r));
}
