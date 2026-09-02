import { useMemo, useState } from "react";
import type { Deal } from "@shared/types";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { formatPKR } from "@/lib/format";
import { useCatalogStore } from "@/store/catalogStore";
import { useCartStore, type CartDealChoiceDisplay } from "@/store/cartStore";

interface Props {
  deal: Deal | null;
  onClose: () => void;
}

export function DealSlotModal({ deal, onClose }: Props) {
  const products = useCatalogStore((s) => s.products);
  const addDealLine = useCartStore((s) => s.addDealLine);
  const [selections, setSelections] = useState<Record<number, { productId: number; variantId: number }>>({});

  const choiceSlots = useMemo(() => deal?.slots.filter((s) => s.kind === "choice") ?? [], [deal]);
  const fixedSlots = useMemo(() => deal?.slots.filter((s) => s.kind === "fixed") ?? [], [deal]);

  if (!deal) return null;

  const eligibleFor = (categoryIds: number[] | null, variantName: string | null) =>
    products
      .filter((p) => p.active && (!categoryIds || categoryIds.includes(p.categoryId)))
      .map((p) => ({ product: p, variant: p.variants.find((v) => v.active && v.variantName === variantName) }))
      .filter((x) => x.variant);

  const allSelected = choiceSlots.every((slot) => selections[slot.id]);

  function handleAdd() {
    if (!deal) return;
    const choices: CartDealChoiceDisplay[] = choiceSlots.map((slot) => {
      const sel = selections[slot.id];
      const product = products.find((p) => p.id === sel.productId)!;
      const variant = product.variants.find((v) => v.id === sel.variantId)!;
      return { slotId: slot.id, productId: product.id, variantId: variant.id, label: slot.label, productName: product.name, variantName: variant.variantName };
    });
    for (const slot of fixedSlots) {
      const product = products.find((p) => p.id === slot.fixedProductId);
      const variant = product?.variants.find((v) => v.id === slot.fixedVariantId);
      choices.push({
        slotId: slot.id,
        productId: slot.fixedProductId!,
        variantId: slot.fixedVariantId!,
        label: slot.quantity > 1 ? `${slot.quantity}x ${slot.label}` : slot.label,
        productName: product?.name ?? slot.label,
        variantName: variant?.variantName ?? ""
      });
    }
    addDealLine({ dealId: deal.id, name: deal.name, unitPrice: deal.price, choices });
    setSelections({});
    onClose();
  }

  return (
    <Modal open={!!deal} onClose={onClose} title={`${deal.name} — ${formatPKR(deal.price)}`} wide>
      <div className="flex flex-col gap-4">
        {fixedSlots.length > 0 && (
          <div className="rounded-lg bg-white/5 p-3 text-sm text-hkd-cream/80">
            Includes: {fixedSlots.map((s) => (s.quantity > 1 ? `${s.quantity}x ${s.label}` : s.label)).join(" + ")}
          </div>
        )}

        {choiceSlots.map((slot) => {
          const eligible = eligibleFor(slot.choiceCategoryIds, slot.choiceVariantName);
          const selected = selections[slot.id];
          return (
            <div key={slot.id}>
              <h4 className="mb-2 font-display text-base text-hkd-yellow">
                {slot.label} <span className="text-xs text-hkd-cream/50">({slot.choiceVariantName})</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {eligible.map(({ product, variant }) => (
                  <button
                    key={product.id}
                    onClick={() => setSelections((prev) => ({ ...prev, [slot.id]: { productId: product.id, variantId: variant!.id } }))}
                    className={`rounded-lg border-2 px-3 py-2 text-left text-sm font-semibold transition-colors ${
                      selected?.productId === product.id
                        ? "border-hkd-pink bg-hkd-pink/20 text-white"
                        : "border-white/10 bg-white/5 text-hkd-cream/80 hover:border-white/30"
                    }`}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end gap-3 border-t border-white/10 pt-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!allSelected} onClick={handleAdd}>
          Add Deal to Order — {formatPKR(deal.price)}
        </Button>
      </div>
    </Modal>
  );
}
