import type { Deal } from "@shared/types";
import { formatPKR } from "@/lib/format";
import { imageForDeal } from "@/lib/images";
import { useCartStore, type CartDealChoiceDisplay } from "@/store/cartStore";
import { useCatalogStore } from "@/store/catalogStore";
import { Button } from "@/components/common/Button";

export function DealCard({ deal, onOpenPicker }: { deal: Deal; onOpenPicker: (deal: Deal) => void }) {
  const products = useCatalogStore((s) => s.products);
  const addDealLine = useCartStore((s) => s.addDealLine);
  const hasChoices = deal.slots.some((s) => s.kind === "choice");
  const description = deal.slots
    .map((s) => (s.kind === "fixed" ? (s.quantity > 1 ? `${s.quantity}x ${s.label}` : s.label) : s.label))
    .join(" + ");

  function addFixedDeal() {
    const choices: CartDealChoiceDisplay[] = deal.slots.map((slot) => {
      const product = products.find((p) => p.id === slot.fixedProductId);
      const variant = product?.variants.find((v) => v.id === slot.fixedVariantId);
      return {
        slotId: slot.id,
        productId: slot.fixedProductId!,
        variantId: slot.fixedVariantId!,
        label: slot.quantity > 1 ? `${slot.quantity}x ${slot.label}` : slot.label,
        productName: product?.name ?? slot.label,
        variantName: variant?.variantName ?? ""
      };
    });
    addDealLine({ dealId: deal.id, name: deal.name, unitPrice: deal.price, choices });
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-hkd-yellow/30 bg-hkd-charcoal shadow-card">
      <img src={imageForDeal(deal.imagePath)} alt={deal.name} className="h-20 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <h3 className="font-display text-sm leading-tight tracking-wide text-hkd-yellow">{deal.name}</h3>
        <p className="text-xs text-hkd-cream/60">{description}</p>
        <Button
          onClick={() => (hasChoices ? onOpenPicker(deal) : addFixedDeal())}
          className="mt-auto w-full"
          size="md"
          variant="success"
        >
          Add — {formatPKR(deal.price)}
        </Button>
      </div>
    </div>
  );
}
