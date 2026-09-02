import type Database from "better-sqlite3";
import type { Category, Deal, DealSlot, Product, ProductVariant } from "../../../shared/types";

interface ProductRow {
  id: number;
  category_id: number;
  name: string;
  is_pizza: number;
  image_path: string | null;
  active: number;
  sort_order: number;
}

interface VariantRow {
  id: number;
  product_id: number;
  variant_name: string;
  price: number;
  active: number;
  sort_order: number;
}

function toVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    variantName: row.variant_name,
    price: row.price,
    active: !!row.active,
    sortOrder: row.sort_order
  };
}

export function listCategories(db: Database.Database, includeInactive = false): Category[] {
  const rows = db
    .prepare(
      `SELECT * FROM categories ${includeInactive ? "" : "WHERE active = 1"} ORDER BY sort_order, name`
    )
    .all() as { id: number; name: string; sort_order: number; active: number }[];
  return rows.map((r) => ({ id: r.id, name: r.name, sortOrder: r.sort_order, active: !!r.active }));
}

export function listProducts(db: Database.Database, includeInactive = false): Product[] {
  const productRows = db
    .prepare(`SELECT * FROM products ${includeInactive ? "" : "WHERE active = 1"} ORDER BY category_id, sort_order, name`)
    .all() as ProductRow[];
  const variantRows = db.prepare("SELECT * FROM product_variants ORDER BY sort_order").all() as VariantRow[];
  const variantsByProduct = new Map<number, ProductVariant[]>();
  for (const v of variantRows) {
    if (!includeInactive && !v.active) continue;
    const arr = variantsByProduct.get(v.product_id) ?? [];
    arr.push(toVariant(v));
    variantsByProduct.set(v.product_id, arr);
  }
  return productRows.map((p) => ({
    id: p.id,
    categoryId: p.category_id,
    name: p.name,
    isPizza: !!p.is_pizza,
    imagePath: p.image_path,
    active: !!p.active,
    sortOrder: p.sort_order,
    variants: variantsByProduct.get(p.id) ?? []
  }));
}

export function getProductVariant(
  db: Database.Database,
  productId: number,
  variantId: number
): { product: ProductRow; variant: VariantRow } | null {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as ProductRow | undefined;
  const variant = db
    .prepare("SELECT * FROM product_variants WHERE id = ? AND product_id = ?")
    .get(variantId, productId) as VariantRow | undefined;
  if (!product || !variant) return null;
  return { product, variant };
}

export function listDeals(db: Database.Database, includeInactive = false): Deal[] {
  const dealRows = db
    .prepare(`SELECT * FROM deals ${includeInactive ? "" : "WHERE active = 1"} ORDER BY sort_order, name`)
    .all() as { id: number; name: string; price: number; image_path: string | null; active: number; sort_order: number }[];
  const slotRows = db.prepare("SELECT * FROM deal_slots ORDER BY deal_id, slot_order").all() as {
    id: number;
    deal_id: number;
    slot_order: number;
    label: string;
    kind: "fixed" | "choice";
    quantity: number;
    fixed_product_id: number | null;
    fixed_variant_id: number | null;
    choice_category_ids: string | null;
    choice_variant_name: string | null;
  }[];
  const slotsByDeal = new Map<number, DealSlot[]>();
  for (const s of slotRows) {
    const arr = slotsByDeal.get(s.deal_id) ?? [];
    arr.push({
      id: s.id,
      dealId: s.deal_id,
      slotOrder: s.slot_order,
      label: s.label,
      kind: s.kind,
      quantity: s.quantity,
      fixedProductId: s.fixed_product_id,
      fixedVariantId: s.fixed_variant_id,
      choiceCategoryIds: s.choice_category_ids ? JSON.parse(s.choice_category_ids) : null,
      choiceVariantName: s.choice_variant_name
    });
    slotsByDeal.set(s.deal_id, arr);
  }
  return dealRows.map((d) => ({
    id: d.id,
    name: d.name,
    price: d.price,
    imagePath: d.image_path,
    active: !!d.active,
    sortOrder: d.sort_order,
    slots: slotsByDeal.get(d.id) ?? []
  }));
}
