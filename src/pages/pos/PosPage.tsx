import { useEffect, useMemo, useState } from "react";
import type { Deal, Settings } from "@shared/types";
import { useCatalogStore } from "@/store/catalogStore";
import { ProductCard } from "@/components/pos/ProductCard";
import { DealCard } from "@/components/pos/DealCard";
import { DealSlotModal } from "@/components/pos/DealSlotModal";
import { CartPanel } from "@/components/pos/CartPanel";

const DEALS_TAB = "__deals__";

export function PosPage() {
  const { categories, products, deals, fetchAll, loaded } = useCatalogStore();
  const [activeCategory, setActiveCategory] = useState<string>(DEALS_TAB);
  const [search, setSearch] = useState("");
  const [pickerDeal, setPickerDeal] = useState<Deal | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (!loaded) fetchAll();
    window.hkd.settings.get().then(setSettings);
  }, [loaded, fetchAll]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term) return products.filter((p) => p.active && p.name.toLowerCase().includes(term));
    if (activeCategory === DEALS_TAB) return [];
    return products.filter((p) => p.active && p.categoryId === Number(activeCategory));
  }, [products, activeCategory, search]);

  const showDeals = !search.trim() && activeCategory === DEALS_TAB;

  return (
    <div className="flex h-full min-w-0">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/10 bg-hkd-charcoal px-4 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream outline-none focus:border-hkd-pink"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory(DEALS_TAB)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                activeCategory === DEALS_TAB ? "bg-hkd-yellow text-hkd-black" : "bg-white/5 text-hkd-cream/70 hover:bg-white/10"
              }`}
            >
              🎁 Deals
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(String(cat.id))}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  activeCategory === String(cat.id) ? "bg-hkd-pink text-white" : "bg-white/5 text-hkd-cream/70 hover:bg-white/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4">
          {showDeals ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {deals
                .filter((d) => d.active)
                .map((deal) => (
                  <DealCard key={deal.id} deal={deal} onOpenPicker={setPickerDeal} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} category={categories.find((c) => c.id === product.categoryId)} />
              ))}
              {filteredProducts.length === 0 && <p className="col-span-full mt-10 text-center text-hkd-cream/40">No products found.</p>}
            </div>
          )}
        </div>
      </div>

      <CartPanel serviceCharge={settings?.serviceChargeDefault ?? 30} />

      <DealSlotModal deal={pickerDeal} onClose={() => setPickerDeal(null)} />
    </div>
  );
}
