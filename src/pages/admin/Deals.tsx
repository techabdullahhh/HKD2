import { ChangeEvent, useEffect, useState } from "react";
import type { Deal, DealSlot } from "@shared/types";
import type { DealSlotInputDTO } from "@shared/api";
import { useCatalogStore } from "@/store/catalogStore";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { formatPKR } from "@/lib/format";
import { imageForDeal } from "@/lib/images";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function slotToInput(slot: DealSlot): DealSlotInputDTO {
  return {
    id: slot.id,
    label: slot.label,
    kind: slot.kind,
    quantity: slot.quantity,
    fixedProductId: slot.fixedProductId,
    fixedVariantId: slot.fixedVariantId,
    choiceCategoryIds: slot.choiceCategoryIds,
    choiceVariantName: slot.choiceVariantName
  };
}

export function DealsPage() {
  const { deals, categories, products, fetchAll } = useCatalogStore();
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: "", price: "" });

  useEffect(() => {
    fetchAll(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    await fetchAll(true);
  }

  async function createDeal() {
    if (!newDeal.name.trim() || !newDeal.price) return;
    await window.hkd.menu.createDeal({ name: newDeal.name.trim(), price: Number(newDeal.price), sortOrder: deals.length, slots: [] });
    setNewDeal({ name: "", price: "" });
    setNewDealOpen(false);
    refresh();
  }

  async function toggleActive(deal: Deal) {
    await window.hkd.menu.setDealActive(deal.id, !deal.active);
    refresh();
  }

  async function savePrice(deal: Deal, price: number) {
    await window.hkd.menu.updateDealPrice(deal.id, price);
    refresh();
  }

  async function handleImageChange(deal: Deal, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const ext = file.name.split(".").pop() ?? "png";
    await window.hkd.menu.setDealImage(deal.id, dataUrl, ext);
    refresh();
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl tracking-wide text-hkd-cream">Deals</h1>
        <Button onClick={() => setNewDealOpen(true)}>+ New Deal</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {deals.map((deal) => (
          <div key={deal.id} className="overflow-hidden rounded-xl border border-white/10 bg-hkd-charcoal">
            <img src={imageForDeal(deal.imagePath)} className="h-20 w-full object-cover" />
            <div className="p-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm text-hkd-yellow">{deal.name}</h3>
                <Badge tone={deal.active ? "green" : "red"}>{deal.active ? "Active" : "Archived"}</Badge>
              </div>
              <p className="mt-1 text-xs text-hkd-cream/60">
                {deal.slots.map((s) => (s.kind === "fixed" ? (s.quantity > 1 ? `${s.quantity}x ${s.label}` : s.label) : s.label)).join(" + ")}
              </p>
              <PriceEditor price={deal.price} onSave={(p) => savePrice(deal, p)} />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="md" variant="secondary" onClick={() => setEditingDeal(deal)}>
                  Edit Contents
                </Button>
                <label className="cursor-pointer">
                  <span className="inline-block rounded-lg bg-hkd-panel px-3 py-1.5 text-sm font-semibold text-hkd-cream hover:bg-white/10">Change Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(deal, e)} />
                </label>
                <Button size="md" variant={deal.active ? "danger" : "success"} onClick={() => toggleActive(deal)}>
                  {deal.active ? "Archive" : "Reactivate"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={newDealOpen} onClose={() => setNewDealOpen(false)} title="New Deal">
        <div className="flex flex-col gap-3">
          <input value={newDeal.name} onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })} placeholder="Deal name" className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <input value={newDeal.price} onChange={(e) => setNewDeal({ ...newDeal, price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="Price (PKR)" className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <Button onClick={createDeal}>Create — then add contents</Button>
        </div>
      </Modal>

      {editingDeal && (
        <SlotEditorModal
          deal={editingDeal}
          categories={categories}
          products={products}
          onClose={() => setEditingDeal(null)}
          onSaved={() => {
            setEditingDeal(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function PriceEditor({ price, onSave }: { price: number; onSave: (price: number) => void }) {
  const [value, setValue] = useState(String(price));
  const dirty = Number(value) !== price;
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-hkd-cream/50">PKR</span>
      <input value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))} className="w-24 rounded-lg border border-white/10 bg-hkd-black px-2 py-1 text-lg font-bold text-hkd-yellow" />
      {dirty && (
        <Button size="md" className="!px-3 !py-1.5 text-sm" onClick={() => onSave(Number(value))}>
          Save
        </Button>
      )}
      <span className="text-xs text-hkd-cream/40">now {formatPKR(price)}</span>
    </div>
  );
}

function SlotEditorModal({
  deal,
  categories,
  products,
  onClose,
  onSaved
}: {
  deal: Deal;
  categories: { id: number; name: string }[];
  products: { id: number; name: string; variants: { id: number; variantName: string }[] }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [slots, setSlots] = useState<DealSlotInputDTO[]>(deal.slots.map(slotToInput));

  function addFixedSlot() {
    setSlots((s) => [...s, { label: "New Item", kind: "fixed", quantity: 1, fixedProductId: products[0]?.id ?? null, fixedVariantId: products[0]?.variants[0]?.id ?? null }]);
  }
  function addChoiceSlot() {
    setSlots((s) => [...s, { label: "New Choice", kind: "choice", quantity: 1, choiceCategoryIds: [], choiceVariantName: "" }]);
  }
  function updateSlot(idx: number, patch: Partial<DealSlotInputDTO>) {
    setSlots((s) => s.map((slot, i) => (i === idx ? { ...slot, ...patch } : slot)));
  }
  function removeSlot(idx: number) {
    setSlots((s) => s.filter((_, i) => i !== idx));
  }

  async function save() {
    await window.hkd.menu.replaceDealSlots(deal.id, slots);
    onSaved();
  }

  return (
    <Modal open onClose={onClose} title={`Edit Contents — ${deal.name}`} wide>
      <div className="flex flex-col gap-4">
        {slots.map((slot, idx) => (
          <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <Badge tone={slot.kind === "fixed" ? "gray" : "yellow"}>{slot.kind === "fixed" ? "Fixed Item" : "Employee Choice"}</Badge>
              <button onClick={() => removeSlot(idx)} className="text-red-400 hover:text-red-300">
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-hkd-cream/50">Label</label>
                <input value={slot.label} onChange={(e) => updateSlot(idx, { label: e.target.value })} className="w-full rounded-lg border border-white/10 bg-hkd-black px-3 py-2 text-hkd-cream" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-hkd-cream/50">Quantity</label>
                <input value={slot.quantity} onChange={(e) => updateSlot(idx, { quantity: Number(e.target.value.replace(/[^0-9]/g, "")) || 1 })} className="w-full rounded-lg border border-white/10 bg-hkd-black px-3 py-2 text-hkd-cream" />
              </div>

              {slot.kind === "fixed" ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-hkd-cream/50">Product</label>
                    <select
                      value={slot.fixedProductId ?? ""}
                      onChange={(e) => {
                        const productId = Number(e.target.value);
                        const product = products.find((p) => p.id === productId);
                        updateSlot(idx, { fixedProductId: productId, fixedVariantId: product?.variants[0]?.id ?? null });
                      }}
                      className="w-full rounded-lg border border-white/10 bg-hkd-black px-3 py-2 text-hkd-cream"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-hkd-cream/50">Variant</label>
                    <select
                      value={slot.fixedVariantId ?? ""}
                      onChange={(e) => updateSlot(idx, { fixedVariantId: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-hkd-black px-3 py-2 text-hkd-cream"
                    >
                      {products
                        .find((p) => p.id === slot.fixedProductId)
                        ?.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.variantName}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs text-hkd-cream/50">Eligible Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => {
                        const selected = slot.choiceCategoryIds?.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() =>
                              updateSlot(idx, {
                                choiceCategoryIds: selected
                                  ? (slot.choiceCategoryIds ?? []).filter((id) => id !== c.id)
                                  : [...(slot.choiceCategoryIds ?? []), c.id]
                              })
                            }
                            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                              selected ? "border-hkd-pink bg-hkd-pink/20 text-white" : "border-white/10 text-hkd-cream/60"
                            }`}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-hkd-cream/50">Required Variant Name</label>
                    <input
                      value={slot.choiceVariantName ?? ""}
                      onChange={(e) => updateSlot(idx, { choiceVariantName: e.target.value })}
                      placeholder="e.g. Large"
                      className="w-full rounded-lg border border-white/10 bg-hkd-black px-3 py-2 text-hkd-cream"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <Button size="md" variant="secondary" onClick={addFixedSlot}>
            + Fixed Item
          </Button>
          <Button size="md" variant="secondary" onClick={addChoiceSlot}>
            + Employee Choice Slot
          </Button>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>Save Contents</Button>
      </div>
    </Modal>
  );
}
