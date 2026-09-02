import type Database from "better-sqlite3";

export function createCategory(db: Database.Database, name: string, sortOrder: number): number {
  const result = db.prepare("INSERT INTO categories (name, sort_order, active) VALUES (?, ?, 1)").run(name, sortOrder);
  return result.lastInsertRowid as number;
}

export function setCategoryActive(db: Database.Database, id: number, active: boolean): void {
  db.prepare("UPDATE categories SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
}

export function renameCategory(db: Database.Database, id: number, name: string): void {
  db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, id);
}

export interface ProductVariantInput {
  id?: number;
  variantName: string;
  price: number;
  active: boolean;
}

export function createProduct(
  db: Database.Database,
  params: { categoryId: number; name: string; isPizza: boolean; sortOrder: number; variants: ProductVariantInput[] }
): number {
  const tx = db.transaction(() => {
    const result = db
      .prepare("INSERT INTO products (category_id, name, is_pizza, active, sort_order) VALUES (?, ?, ?, 1, ?)")
      .run(params.categoryId, params.name, params.isPizza ? 1 : 0, params.sortOrder);
    const productId = result.lastInsertRowid as number;
    const insertVariant = db.prepare(
      "INSERT INTO product_variants (product_id, variant_name, price, active, sort_order) VALUES (?, ?, ?, 1, ?)"
    );
    params.variants.forEach((v, idx) => insertVariant.run(productId, v.variantName, v.price, idx));
    return productId;
  });
  return tx();
}

export function updateProduct(
  db: Database.Database,
  productId: number,
  params: { name?: string; categoryId?: number; isPizza?: boolean }
): void {
  if (params.name !== undefined) db.prepare("UPDATE products SET name = ?, updated_at = datetime('now') WHERE id = ?").run(params.name, productId);
  if (params.categoryId !== undefined)
    db.prepare("UPDATE products SET category_id = ?, updated_at = datetime('now') WHERE id = ?").run(params.categoryId, productId);
  if (params.isPizza !== undefined)
    db.prepare("UPDATE products SET is_pizza = ?, updated_at = datetime('now') WHERE id = ?").run(params.isPizza ? 1 : 0, productId);
}

export function setProductActive(db: Database.Database, productId: number, active: boolean): void {
  db.prepare("UPDATE products SET active = ?, updated_at = datetime('now') WHERE id = ?").run(active ? 1 : 0, productId);
}

export function setProductImage(db: Database.Database, productId: number, imagePath: string | null): void {
  db.prepare("UPDATE products SET image_path = ?, updated_at = datetime('now') WHERE id = ?").run(imagePath, productId);
}

export function setDealImage(db: Database.Database, dealId: number, imagePath: string | null): void {
  db.prepare("UPDATE deals SET image_path = ?, updated_at = datetime('now') WHERE id = ?").run(imagePath, dealId);
}

export function upsertVariant(db: Database.Database, productId: number, variant: ProductVariantInput): number {
  if (variant.id) {
    db.prepare("UPDATE product_variants SET variant_name = ?, price = ?, active = ? WHERE id = ?").run(
      variant.variantName,
      variant.price,
      variant.active ? 1 : 0,
      variant.id
    );
    return variant.id;
  }
  const maxSort = (db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM product_variants WHERE product_id = ?").get(
    productId
  ) as { m: number }).m;
  const result = db
    .prepare("INSERT INTO product_variants (product_id, variant_name, price, active, sort_order) VALUES (?, ?, ?, 1, ?)")
    .run(productId, variant.variantName, variant.price, maxSort + 1);
  return result.lastInsertRowid as number;
}

export function setVariantActive(db: Database.Database, variantId: number, active: boolean): void {
  db.prepare("UPDATE product_variants SET active = ? WHERE id = ?").run(active ? 1 : 0, variantId);
}

export interface DealSlotInput {
  label: string;
  kind: "fixed" | "choice";
  quantity: number;
  fixedProductId?: number | null;
  fixedVariantId?: number | null;
  choiceCategoryIds?: number[] | null;
  choiceVariantName?: string | null;
}

export function createDeal(
  db: Database.Database,
  params: { name: string; price: number; sortOrder: number; slots: DealSlotInput[] }
): number {
  const tx = db.transaction(() => {
    const result = db
      .prepare("INSERT INTO deals (name, price, active, sort_order) VALUES (?, ?, 1, ?)")
      .run(params.name, params.price, params.sortOrder);
    const dealId = result.lastInsertRowid as number;
    const insertSlot = db.prepare(
      `INSERT INTO deal_slots (deal_id, slot_order, label, kind, quantity, fixed_product_id, fixed_variant_id, choice_category_ids, choice_variant_name)
       VALUES (@dealId, @slotOrder, @label, @kind, @quantity, @fixedProductId, @fixedVariantId, @choiceCategoryIds, @choiceVariantName)`
    );
    params.slots.forEach((s, idx) =>
      insertSlot.run({
        dealId,
        slotOrder: idx,
        label: s.label,
        kind: s.kind,
        quantity: s.quantity,
        fixedProductId: s.fixedProductId ?? null,
        fixedVariantId: s.fixedVariantId ?? null,
        choiceCategoryIds: s.choiceCategoryIds ? JSON.stringify(s.choiceCategoryIds) : null,
        choiceVariantName: s.choiceVariantName ?? null
      })
    );
    return dealId;
  });
  return tx();
}

export function updateDealPrice(db: Database.Database, dealId: number, price: number): void {
  db.prepare("UPDATE deals SET price = ?, updated_at = datetime('now') WHERE id = ?").run(price, dealId);
}

export function setDealActive(db: Database.Database, dealId: number, active: boolean): void {
  db.prepare("UPDATE deals SET active = ?, updated_at = datetime('now') WHERE id = ?").run(active ? 1 : 0, dealId);
}

export function replaceDealSlots(db: Database.Database, dealId: number, slots: DealSlotInput[]): void {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM deal_slots WHERE deal_id = ?").run(dealId);
    const insertSlot = db.prepare(
      `INSERT INTO deal_slots (deal_id, slot_order, label, kind, quantity, fixed_product_id, fixed_variant_id, choice_category_ids, choice_variant_name)
       VALUES (@dealId, @slotOrder, @label, @kind, @quantity, @fixedProductId, @fixedVariantId, @choiceCategoryIds, @choiceVariantName)`
    );
    slots.forEach((s, idx) =>
      insertSlot.run({
        dealId,
        slotOrder: idx,
        label: s.label,
        kind: s.kind,
        quantity: s.quantity,
        fixedProductId: s.fixedProductId ?? null,
        fixedVariantId: s.fixedVariantId ?? null,
        choiceCategoryIds: s.choiceCategoryIds ? JSON.stringify(s.choiceCategoryIds) : null,
        choiceVariantName: s.choiceVariantName ?? null
      })
    );
  });
  tx();
}
