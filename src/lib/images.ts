import pizza from "@/assets/images/pizza.svg";
import burger from "@/assets/images/burger.svg";
import shawarma from "@/assets/images/shawarma.svg";
import chicken from "@/assets/images/chicken.svg";
import fries from "@/assets/images/fries.svg";
import pasta from "@/assets/images/pasta.svg";
import roll from "@/assets/images/roll.svg";
import drink from "@/assets/images/drink.svg";
import deal from "@/assets/images/deal.svg";

const CATEGORY_IMAGE: Record<string, string> = {
  "HKD Special Pizzas": pizza,
  "HKD Regular Pizzas": pizza,
  "Burger Station": burger,
  "Shawarma Station": shawarma,
  "Chicken Station": chicken,
  "Sides & Rolls": fries,
  Drinks: drink
};

const PRODUCT_NAME_IMAGE: Record<string, string> = {
  "Chicken Pasta": pasta,
  "Zinger Roll Paratha": roll
};

export function imageForProduct(productName: string, categoryName: string | undefined, imagePath: string | null): string {
  if (imagePath) return imagePath;
  if (PRODUCT_NAME_IMAGE[productName]) return PRODUCT_NAME_IMAGE[productName];
  if (categoryName && CATEGORY_IMAGE[categoryName]) return CATEGORY_IMAGE[categoryName];
  return deal;
}

export function imageForDeal(imagePath: string | null): string {
  return imagePath ?? deal;
}
