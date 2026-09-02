import { ipcMain } from "electron";
import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import { MEDIA_SCHEME } from "../mediaProtocol";
import { getImagesDir } from "../db";
import * as menuAdmin from "../services/menuAdmin";
import { logAudit } from "../services/audit";
import { requireAdmin } from "../state";

function saveDataUrlImage(prefix: string, id: number, dataUrl: string, fileExt = "png"): string {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const buffer = Buffer.from(base64, "base64");
  const fileName = `${prefix}-${id}-${Date.now()}.${fileExt.replace(/[^a-z0-9]/gi, "") || "png"}`;
  fs.writeFileSync(path.join(getImagesDir(), fileName), buffer);
  return `${MEDIA_SCHEME}://${fileName}`;
}

export function registerMenuIpc(db: Database.Database): void {
  ipcMain.handle(CH.menuCreateCategory, (_e, name: string, sortOrder: number) => {
    const admin = requireAdmin();
    const id = menuAdmin.createCategory(db, name, sortOrder);
    logAudit(db, { userId: admin.id, action: "category_created", entityType: "category", entityId: id, details: { name } });
    return id;
  });

  ipcMain.handle(CH.menuRenameCategory, (_e, id: number, name: string) => {
    const admin = requireAdmin();
    menuAdmin.renameCategory(db, id, name);
    logAudit(db, { userId: admin.id, action: "category_renamed", entityType: "category", entityId: id, details: { name } });
  });

  ipcMain.handle(CH.menuSetCategoryActive, (_e, id: number, active: boolean) => {
    const admin = requireAdmin();
    menuAdmin.setCategoryActive(db, id, active);
    logAudit(db, { userId: admin.id, action: active ? "category_activated" : "category_archived", entityType: "category", entityId: id });
  });

  ipcMain.handle(
    CH.menuCreateProduct,
    (
      _e,
      params: {
        categoryId: number;
        name: string;
        isPizza: boolean;
        sortOrder: number;
        variants: menuAdmin.ProductVariantInput[];
      }
    ) => {
      const admin = requireAdmin();
      const id = menuAdmin.createProduct(db, params);
      logAudit(db, { userId: admin.id, action: "product_created", entityType: "product", entityId: id, details: { name: params.name } });
      return id;
    }
  );

  ipcMain.handle(
    CH.menuUpdateProduct,
    (_e, productId: number, params: { name?: string; categoryId?: number; isPizza?: boolean }) => {
      const admin = requireAdmin();
      menuAdmin.updateProduct(db, productId, params);
      logAudit(db, { userId: admin.id, action: "product_updated", entityType: "product", entityId: productId, details: params });
    }
  );

  ipcMain.handle(CH.menuSetProductActive, (_e, productId: number, active: boolean) => {
    const admin = requireAdmin();
    menuAdmin.setProductActive(db, productId, active);
    logAudit(db, { userId: admin.id, action: active ? "product_activated" : "product_archived", entityType: "product", entityId: productId });
  });

  ipcMain.handle(CH.menuUpsertVariant, (_e, productId: number, variant: menuAdmin.ProductVariantInput) => {
    const admin = requireAdmin();
    const id = menuAdmin.upsertVariant(db, productId, variant);
    logAudit(db, {
      userId: admin.id,
      action: variant.id ? "variant_price_changed" : "variant_created",
      entityType: "product_variant",
      entityId: id,
      details: { productId, variantName: variant.variantName, price: variant.price }
    });
    return id;
  });

  ipcMain.handle(CH.menuSetVariantActive, (_e, variantId: number, active: boolean) => {
    const admin = requireAdmin();
    menuAdmin.setVariantActive(db, variantId, active);
    logAudit(db, { userId: admin.id, action: active ? "variant_activated" : "variant_archived", entityType: "product_variant", entityId: variantId });
  });

  ipcMain.handle(CH.menuSetProductImage, (_e, productId: number, dataUrl: string | null, fileExt?: string) => {
    const admin = requireAdmin();
    const imagePath = dataUrl ? saveDataUrlImage("product", productId, dataUrl, fileExt) : null;
    menuAdmin.setProductImage(db, productId, imagePath);
    logAudit(db, { userId: admin.id, action: "product_image_changed", entityType: "product", entityId: productId });
    return imagePath;
  });

  ipcMain.handle(
    CH.menuCreateDeal,
    (_e, params: { name: string; price: number; sortOrder: number; slots: menuAdmin.DealSlotInput[] }) => {
      const admin = requireAdmin();
      const id = menuAdmin.createDeal(db, params);
      logAudit(db, { userId: admin.id, action: "deal_created", entityType: "deal", entityId: id, details: { name: params.name, price: params.price } });
      return id;
    }
  );

  ipcMain.handle(CH.menuUpdateDealPrice, (_e, dealId: number, price: number) => {
    const admin = requireAdmin();
    menuAdmin.updateDealPrice(db, dealId, price);
    logAudit(db, { userId: admin.id, action: "deal_price_changed", entityType: "deal", entityId: dealId, details: { price } });
  });

  ipcMain.handle(CH.menuSetDealActive, (_e, dealId: number, active: boolean) => {
    const admin = requireAdmin();
    menuAdmin.setDealActive(db, dealId, active);
    logAudit(db, { userId: admin.id, action: active ? "deal_activated" : "deal_archived", entityType: "deal", entityId: dealId });
  });

  ipcMain.handle(CH.menuReplaceDealSlots, (_e, dealId: number, slots: menuAdmin.DealSlotInput[]) => {
    const admin = requireAdmin();
    menuAdmin.replaceDealSlots(db, dealId, slots);
    logAudit(db, { userId: admin.id, action: "deal_contents_changed", entityType: "deal", entityId: dealId });
  });

  ipcMain.handle(CH.menuSetDealImage, (_e, dealId: number, dataUrl: string | null, fileExt?: string) => {
    const admin = requireAdmin();
    const imagePath = dataUrl ? saveDataUrlImage("deal", dealId, dataUrl, fileExt) : null;
    menuAdmin.setDealImage(db, dealId, imagePath);
    logAudit(db, { userId: admin.id, action: "deal_image_changed", entityType: "deal", entityId: dealId });
    return imagePath;
  });
}
