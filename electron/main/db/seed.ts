import type Database from "better-sqlite3";
import bcrypt from "bcryptjs";

interface VariantSeed {
  name: string;
  price: number;
}

interface ProductSeed {
  name: string;
  isPizza: boolean;
  variants: VariantSeed[];
}

interface CategorySeed {
  name: string;
  products: ProductSeed[];
}

// Canonical HKD menu. Prices verified against the original menu-board photos
// with only the explicitly requested changes applied (see build plan for the
// item-by-item comparison). Do not adjust any of these without an explicit
// instruction to change that specific item's price.
const MENU: CategorySeed[] = [
  {
    name: "HKD Special Pizzas",
    products: [
      { name: "Crown Crust", isPizza: true, variants: [{ name: "Small", price: 550 }, { name: "Medium", price: 800 }, { name: "Large", price: 1200 }] },
      { name: "Kabab Crust", isPizza: true, variants: [{ name: "Small", price: 550 }, { name: "Medium", price: 800 }, { name: "Large", price: 1200 }] },
      { name: "Malai Botti", isPizza: true, variants: [{ name: "Small", price: 550 }, { name: "Medium", price: 800 }, { name: "Large", price: 1200 }] }
    ]
  },
  {
    name: "HKD Regular Pizzas",
    products: [
      { name: "Tika", isPizza: true, variants: [{ name: "Small", price: 500 }, { name: "Medium", price: 700 }, { name: "Large", price: 850 }] },
      { name: "Fajita", isPizza: true, variants: [{ name: "Small", price: 500 }, { name: "Medium", price: 700 }, { name: "Large", price: 850 }] },
      { name: "Creme", isPizza: true, variants: [{ name: "Small", price: 500 }, { name: "Medium", price: 700 }, { name: "Large", price: 850 }] },
      { name: "Cheese Lover", isPizza: true, variants: [{ name: "Small", price: 500 }, { name: "Medium", price: 700 }, { name: "Large", price: 850 }] },
      { name: "BBQ", isPizza: true, variants: [{ name: "Small", price: 500 }, { name: "Medium", price: 700 }, { name: "Large", price: 850 }] }
    ]
  },
  {
    name: "Burger Station",
    products: [
      { name: "Zinger Burger", isPizza: false, variants: [{ name: "Regular", price: 300 }] },
      { name: "Mighty Burger", isPizza: false, variants: [{ name: "Regular", price: 400 }] }
    ]
  },
  {
    name: "Shawarma Station",
    products: [
      // Original menu shows two unlabeled price tiers for Chicken Shawarma.
      // Per explicit instruction, no size/name is invented for these variants.
      { name: "Chicken Shawarma", isPizza: false, variants: [{ name: "PKR 150", price: 150 }, { name: "PKR 250", price: 250 }] },
      { name: "Zinger Shawarma", isPizza: false, variants: [{ name: "Regular", price: 300 }] }
    ]
  },
  {
    name: "Chicken Station",
    products: [
      { name: "10 Nuggets", isPizza: false, variants: [{ name: "Regular", price: 500 }] },
      { name: "10 Hot Wings", isPizza: false, variants: [{ name: "Regular", price: 550 }] }
    ]
  },
  {
    name: "Sides & Rolls",
    products: [
      { name: "Loaded Fries", isPizza: false, variants: [{ name: "Small", price: 300 }, { name: "Large", price: 450 }] },
      { name: "Chicken Pasta", isPizza: false, variants: [{ name: "Small", price: 450 }, { name: "Large", price: 650 }] },
      { name: "Zinger Roll Paratha", isPizza: false, variants: [{ name: "Regular", price: 350 }] }
    ]
  },
  {
    name: "Drinks",
    products: [
      { name: "NR Bottle", isPizza: false, variants: [{ name: "Regular", price: 80 }] },
      { name: "1 Ltr Bottle", isPizza: false, variants: [{ name: "Regular", price: 150 }] },
      { name: "1.5 Ltr Bottle", isPizza: false, variants: [{ name: "Regular", price: 230 }] }
      // Lemon Soda intentionally removed per explicit instruction.
    ]
  }
];

type SlotSeed =
  | { kind: "fixed"; label: string; productName: string; variantName: string; quantity: number }
  | { kind: "choice"; label: string; categoryNames: string[]; variantName: string; quantity: number };

interface DealSeed {
  name: string;
  price: number;
  slots: SlotSeed[];
}

const DEALS: DealSeed[] = [
  {
    name: "Student Deal",
    price: 750,
    slots: [
      { kind: "fixed", label: "Zinger Burger", productName: "Zinger Burger", variantName: "Regular", quantity: 2 },
      { kind: "fixed", label: "NR Drink", productName: "NR Bottle", variantName: "Regular", quantity: 1 }
    ]
  },
  {
    name: "HKD Special Deal",
    price: 1300,
    slots: [
      { kind: "fixed", label: "Zinger Burger", productName: "Zinger Burger", variantName: "Regular", quantity: 4 },
      { kind: "fixed", label: "1 Ltr Drink", productName: "1 Ltr Bottle", variantName: "Regular", quantity: 1 }
    ]
  },
  {
    name: "Couple Deal",
    price: 800,
    slots: [
      { kind: "choice", label: "Medium Pizza", categoryNames: ["HKD Special Pizzas", "HKD Regular Pizzas"], variantName: "Medium", quantity: 1 },
      { kind: "fixed", label: "1 Ltr Drink", productName: "1 Ltr Bottle", variantName: "Regular", quantity: 1 }
    ]
  },
  {
    name: "Friend Deal",
    price: 1150,
    slots: [
      { kind: "choice", label: "Large Pizza", categoryNames: ["HKD Special Pizzas", "HKD Regular Pizzas"], variantName: "Large", quantity: 1 },
      { kind: "fixed", label: "1.5 Ltr Drink", productName: "1.5 Ltr Bottle", variantName: "Regular", quantity: 1 }
    ]
  },
  {
    name: "Family Deal",
    price: 2800,
    slots: [
      { kind: "fixed", label: "Crown Crust Pizza (Large)", productName: "Crown Crust", variantName: "Large", quantity: 1 },
      { kind: "fixed", label: "Malai Botti Pizza (Medium)", productName: "Malai Botti", variantName: "Medium", quantity: 1 },
      { kind: "fixed", label: "Chicken Pasta (Large)", productName: "Chicken Pasta", variantName: "Large", quantity: 1 },
      { kind: "fixed", label: "1.5 Ltr Bottle", productName: "1.5 Ltr Bottle", variantName: "Regular", quantity: 1 }
    ]
  },
  {
    name: "Kids Deal",
    price: 900,
    slots: [
      { kind: "fixed", label: "10 Nuggets", productName: "10 Nuggets", variantName: "Regular", quantity: 1 },
      { kind: "fixed", label: "10 Hot Wings", productName: "10 Hot Wings", variantName: "Regular", quantity: 1 },
      { kind: "fixed", label: "NR Bottle", productName: "NR Bottle", variantName: "Regular", quantity: 1 }
    ]
  },
  {
    name: "2 Large Pizza Deal",
    price: 1800,
    slots: [
      { kind: "choice", label: "Pizza 1", categoryNames: ["HKD Special Pizzas", "HKD Regular Pizzas"], variantName: "Large", quantity: 1 },
      { kind: "choice", label: "Pizza 2", categoryNames: ["HKD Special Pizzas", "HKD Regular Pizzas"], variantName: "Large", quantity: 1 },
      { kind: "fixed", label: "1.5 Ltr Drink", productName: "1.5 Ltr Bottle", variantName: "Regular", quantity: 1 }
    ]
  }
];

const DEFAULT_SETTINGS: Record<string, string> = {
  serviceChargeDefault: "30",
  businessDayStartHour: "6",
  printerName: "",
  printerPaperWidthMm: "80",
  restaurantNameEn: "HASHMI KA DERA — HKD",
  restaurantNameUr: "ہاشمی کا ڈیرہ",
  restaurantPhone: "0328-5854072 / 0334-8444584"
};

export function seedIfEmpty(db: Database.Database): void {
  const categoryCount = (db.prepare("SELECT COUNT(*) AS c FROM categories").get() as { c: number }).c;
  if (categoryCount > 0) return;

  const seed = db.transaction(() => {
    const insertCategory = db.prepare("INSERT INTO categories (name, sort_order, active) VALUES (?, ?, 1)");
    const insertProduct = db.prepare(
      "INSERT INTO products (category_id, name, is_pizza, active, sort_order) VALUES (?, ?, ?, 1, ?)"
    );
    const insertVariant = db.prepare(
      "INSERT INTO product_variants (product_id, variant_name, price, active, sort_order) VALUES (?, ?, ?, 1, ?)"
    );

    const categoryIdByName = new Map<string, number>();
    const productIdByName = new Map<string, number>();
    const variantIdByProductAndName = new Map<string, number>();

    MENU.forEach((cat, catIdx) => {
      const catResult = insertCategory.run(cat.name, catIdx);
      const categoryId = catResult.lastInsertRowid as number;
      categoryIdByName.set(cat.name, categoryId);

      cat.products.forEach((prod, prodIdx) => {
        const prodResult = insertProduct.run(categoryId, prod.name, prod.isPizza ? 1 : 0, prodIdx);
        const productId = prodResult.lastInsertRowid as number;
        productIdByName.set(prod.name, productId);

        prod.variants.forEach((variant, variantIdx) => {
          const variantResult = insertVariant.run(productId, variant.name, variant.price, variantIdx);
          const variantId = variantResult.lastInsertRowid as number;
          variantIdByProductAndName.set(`${productId}:${variant.name}`, variantId);
        });
      });
    });

    const insertDeal = db.prepare("INSERT INTO deals (name, price, active, sort_order) VALUES (?, ?, 1, ?)");
    const insertSlot = db.prepare(
      `INSERT INTO deal_slots
        (deal_id, slot_order, label, kind, quantity, fixed_product_id, fixed_variant_id, choice_category_ids, choice_variant_name)
       VALUES (@dealId, @slotOrder, @label, @kind, @quantity, @fixedProductId, @fixedVariantId, @choiceCategoryIds, @choiceVariantName)`
    );

    DEALS.forEach((deal, dealIdx) => {
      const dealResult = insertDeal.run(deal.name, deal.price, dealIdx);
      const dealId = dealResult.lastInsertRowid as number;

      deal.slots.forEach((slot, slotIdx) => {
        if (slot.kind === "fixed") {
          const productId = productIdByName.get(slot.productName);
          if (!productId) throw new Error(`Seed error: unknown product "${slot.productName}" referenced by deal "${deal.name}"`);
          const variantId = variantIdByProductAndName.get(`${productId}:${slot.variantName}`);
          if (!variantId) throw new Error(`Seed error: unknown variant "${slot.variantName}" for "${slot.productName}"`);
          insertSlot.run({
            dealId,
            slotOrder: slotIdx,
            label: slot.label,
            kind: "fixed",
            quantity: slot.quantity,
            fixedProductId: productId,
            fixedVariantId: variantId,
            choiceCategoryIds: null,
            choiceVariantName: null
          });
        } else {
          const categoryIds = slot.categoryNames.map((name) => {
            const id = categoryIdByName.get(name);
            if (!id) throw new Error(`Seed error: unknown category "${name}" referenced by deal "${deal.name}"`);
            return id;
          });
          insertSlot.run({
            dealId,
            slotOrder: slotIdx,
            label: slot.label,
            kind: "choice",
            quantity: slot.quantity,
            fixedProductId: null,
            fixedVariantId: null,
            choiceCategoryIds: JSON.stringify(categoryIds),
            choiceVariantName: slot.variantName
          });
        }
      });
    });

    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      insertSetting.run(key, value);
    }

    const insertUser = db.prepare(
      "INSERT INTO users (username, password_hash, full_name, role, active) VALUES (?, ?, ?, ?, 1)"
    );
    insertUser.run("admin", bcrypt.hashSync("admin123", 10), "Administrator", "admin");
    insertUser.run("employee", bcrypt.hashSync("employee123", 10), "Employee One", "employee");
  });

  seed();
}
