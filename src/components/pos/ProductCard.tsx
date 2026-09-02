import type { Category, Product } from "@shared/types";
import { formatPKR } from "@/lib/format";
import { imageForProduct } from "@/lib/images";
import { useCartStore } from "@/store/cartStore";

export function ProductCard({ product, category }: { product: Product; category: Category | undefined }) {
  const addProductLine = useCartStore((s) => s.addProductLine);
  const variants = product.variants.filter((v) => v.active);
  const image = imageForProduct(product.name, category?.name, product.imagePath);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-hkd-charcoal shadow-card">
      <img src={image} alt={product.name} className="h-20 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <h3 className="font-display text-sm leading-tight tracking-wide text-hkd-cream">{product.name}</h3>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() =>
                addProductLine({
                  productId: product.id,
                  variantId: variant.id,
                  name: product.name,
                  variantName: variant.variantName,
                  unitPrice: variant.price
                })
              }
              className="flex-1 min-w-[72px] rounded-lg bg-hkd-pink px-2 py-1.5 text-center font-bold text-white transition-colors hover:bg-hkd-pink-dark active:scale-[0.97]"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
                {variant.variantName === "Regular" ? "Add" : variant.variantName}
              </div>
              <div className="text-sm">{formatPKR(variant.price)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
