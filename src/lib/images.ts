import crownCrust from "@/assets/images/photos/crown-crust.jpg";
import kababCrust from "@/assets/images/photos/kabab-crust.jpg";
import malaiBotti from "@/assets/images/photos/malai-botti.jpg";
import tika from "@/assets/images/photos/tika.jpg";
import fajita from "@/assets/images/photos/fajita.jpg";
import creme from "@/assets/images/photos/creme.jpg";
import cheeseLover from "@/assets/images/photos/cheese-lover.jpg";
import bbq from "@/assets/images/photos/bbq.jpg";
import zingerBurger from "@/assets/images/photos/zinger-burger.jpg";
import mightyBurger from "@/assets/images/photos/mighty-burger.jpg";
import chickenShawarma from "@/assets/images/photos/chicken-shawarma.jpg";
import zingerShawarma from "@/assets/images/photos/zinger-shawarma.jpg";
import nuggets from "@/assets/images/photos/nuggets.jpg";
import hotWings from "@/assets/images/photos/hot-wings.jpg";
import loadedFries from "@/assets/images/photos/loaded-fries.jpg";
import chickenPasta from "@/assets/images/photos/chicken-pasta.jpg";
import rollParatha from "@/assets/images/photos/roll-paratha.jpg";
import drinkBottle from "@/assets/images/photos/drink-bottle.jpg";

// Every specific product gets its own real photograph. Falls back to a
// representative photo for the item's category only if a brand-new product
// hasn't been matched here yet or hasn't had a custom photo uploaded by Admin.
const PRODUCT_NAME_IMAGE: Record<string, string> = {
  "Crown Crust": crownCrust,
  "Kabab Crust": kababCrust,
  "Malai Botti": malaiBotti,
  Tika: tika,
  Fajita: fajita,
  Creme: creme,
  "Cheese Lover": cheeseLover,
  BBQ: bbq,
  "Zinger Burger": zingerBurger,
  "Mighty Burger": mightyBurger,
  "Chicken Shawarma": chickenShawarma,
  "Zinger Shawarma": zingerShawarma,
  "10 Nuggets": nuggets,
  "10 Hot Wings": hotWings,
  "Loaded Fries": loadedFries,
  "Chicken Pasta": chickenPasta,
  "Zinger Roll Paratha": rollParatha,
  "NR Bottle": drinkBottle,
  "1 Ltr Bottle": drinkBottle,
  "1.5 Ltr Bottle": drinkBottle
};

const CATEGORY_FALLBACK_IMAGE: Record<string, string> = {
  "HKD Special Pizzas": crownCrust,
  "HKD Regular Pizzas": tika,
  "Burger Station": zingerBurger,
  "Shawarma Station": chickenShawarma,
  "Chicken Station": nuggets,
  "Sides & Rolls": loadedFries,
  Drinks: drinkBottle
};

// Representative real photo per deal, reusing the actual dish photography
// above rather than a separate generic "deal" graphic.
const DEAL_NAME_IMAGE: Record<string, string> = {
  "Student Deal": zingerBurger,
  "HKD Special Deal": mightyBurger,
  "Couple Deal": malaiBotti,
  "Friend Deal": kababCrust,
  "Family Deal": crownCrust,
  "Kids Deal": nuggets,
  "2 Large Pizza Deal": bbq
};

export function imageForProduct(productName: string, categoryName: string | undefined, imagePath: string | null): string {
  if (imagePath) return imagePath;
  if (PRODUCT_NAME_IMAGE[productName]) return PRODUCT_NAME_IMAGE[productName];
  if (categoryName && CATEGORY_FALLBACK_IMAGE[categoryName]) return CATEGORY_FALLBACK_IMAGE[categoryName];
  return crownCrust;
}

export function imageForDeal(dealName: string, imagePath: string | null): string {
  if (imagePath) return imagePath;
  return DEAL_NAME_IMAGE[dealName] ?? crownCrust;
}
