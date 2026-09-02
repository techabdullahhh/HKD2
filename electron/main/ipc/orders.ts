import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import type { OrderItemInput, PaymentMethod } from "../../../shared/types";
import { cancelOrder, checkoutOrder, createHeldOrder, getOrderById, listHeldOrders, listOrders, type OrderFilter } from "../services/orders";
import { logAudit } from "../services/audit";
import { requireAdmin, requireAuth, requireSession, UnauthorizedError } from "../state";

export function registerOrdersIpc(db: Database.Database): void {
  ipcMain.handle(CH.ordersHold, (_e, items: OrderItemInput[]) => {
    const user = requireAuth();
    const session = requireSession();
    const order = createHeldOrder(db, { employeeSessionId: session.id, userId: user.id, items });
    logAudit(db, { userId: user.id, action: "order_held", entityType: "order", entityId: order.id });
    return order;
  });

  ipcMain.handle(
    CH.ordersCheckout,
    (
      _e,
      params: { orderId?: number; items?: OrderItemInput[]; paymentMethod: PaymentMethod; amountTendered?: number }
    ) => {
      const user = requireAuth();
      const session = requireSession();

      // Resuming a held order: only its own owner (or an admin) may check it out.
      if (params.orderId) {
        const existing = getOrderById(db, params.orderId);
        if (!existing) throw new Error("Order not found");
        if (user.role !== "admin" && existing.userId !== user.id) {
          throw new UnauthorizedError("You can only complete your own held orders");
        }
      }

      const order = checkoutOrder(db, {
        orderId: params.orderId,
        employeeSessionId: session.id,
        userId: user.id,
        items: params.items,
        paymentMethod: params.paymentMethod,
        amountTendered: params.amountTendered
      });
      logAudit(db, { userId: user.id, action: "order_completed", entityType: "order", entityId: order.id, details: { grandTotal: order.grandTotal } });
      return order;
    }
  );

  ipcMain.handle(CH.ordersCancel, (_e, orderId: number, reason: string) => {
    const admin = requireAdmin();
    const order = cancelOrder(db, orderId, reason);
    logAudit(db, { userId: admin.id, action: "order_cancelled", entityType: "order", entityId: orderId, details: { reason } });
    return order;
  });

  // Any logged-in user may look up an order by id (needed for printing/detail
  // views), but a non-admin only ever gets their own — never another
  // employee's invoice.
  ipcMain.handle(CH.ordersGet, (_e, orderId: number) => {
    const user = requireAuth();
    const order = getOrderById(db, orderId);
    if (!order) return null;
    if (user.role !== "admin" && order.userId !== user.id) {
      throw new UnauthorizedError("You can only view your own invoices");
    }
    return order;
  });

  ipcMain.handle(CH.ordersListHeld, () => {
    const user = requireAuth();
    // Employees only see/resume held orders they personally started; admins
    // see everything (e.g. to help clear an abandoned held order).
    return listHeldOrders(db, user.role === "admin" ? undefined : user.id);
  });

  ipcMain.handle(CH.ordersList, (_e, filter?: OrderFilter) => {
    requireAdmin();
    return listOrders(db, filter);
  });
}
