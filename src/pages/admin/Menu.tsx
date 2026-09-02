import { ChangeEvent, useEffect, useState } from "react";
import type { Category, Product, ProductVariant } from "@shared/types";
import { useCatalogStore } from "@/store/catalogStore";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { formatPKR } from "@/lib/format";
import { imageForProduct } from "@/lib/images";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MenuPage() {
  const { categories, products, fetchAll } = useCatalogStore();
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", isPizza: false, variantName: "Regular", price: "" });

  useEffect(() => {
    fetchAll(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) setActiveCategoryId(categories[0].id);
  }, [categories, activeCategoryId]);

  async function refresh() {
    await fetchAll(true);
  }

  async function createCategory() {
    if (!newCategoryName.trim()) return;
    await window.hkd.menu.createCategory(newCategoryName.trim(), categories.length);
    setNewCategoryName("");
    setNewCategoryOpen(false);
    refresh();
  }

  async function toggleCategoryActive(cat: Category) {
    await window.hkd.menu.setCategoryActive(cat.id, !cat.active);
    refresh();
  }

  async function createProduct() {
    if (!activeCategoryId || !newProduct.name.trim() || !newProduct.price) return;
    await window.hkd.menu.createProduct({
      categoryId: activeCategoryId,
      name: newProduct.name.trim(),
      isPizza: newProduct.isPizza,
      sortOrder: products.filter((p) => p.categoryId === activeCategoryId).length,
      variants: [{ variantName: newProduct.variantName || "Regular", price: Number(newProduct.price), active: true }]
    });
    setNewProduct({ name: "", isPizza: false, variantName: "Regular", price: "" });
    setNewProductOpen(false);
    refresh();
  }

  async function toggleProductActive(p: Product) {
    await window.hkd.menu.setProductActive(p.id, !p.active);
    refresh();
  }

  async function saveVariant(productId: number, variant: ProductVariant, price: number) {
    await window.hkd.menu.upsertVariant(productId, { id: variant.id, variantName: variant.variantName, price, active: variant.active });
    refresh();
  }

  async function toggleVariantActive(variant: ProductVariant) {
    await window.hkd.menu.setVariantActive(variant.id, !variant.active);
    refresh();
  }

  async function addVariant(productId: number) {
    const variantName = prompt("Variant name (e.g. Small, Medium, Large)?");
    if (!variantName) return;
    const priceStr = prompt("Price (PKR)?");
    if (!priceStr) return;
    await window.hkd.menu.upsertVariant(productId, { variantName, price: Number(priceStr), active: true });
    refresh();
  }

  async function handleImageChange(product: Product, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const ext = file.name.split(".").pop() ?? "png";
    await window.hkd.menu.setProductImage(product.id, dataUrl, ext);
    refresh();
  }

  const visibleProducts = products.filter((p) => p.categoryId === activeCategoryId);

  return (
    <div className="flex h-full">
      <div className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-hkd-charcoal p-4">
        <Button size="md" variant="secondary" className="mb-3" onClick={() => setNewCategoryOpen(true)}>
          + Category
        </Button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${
              activeCategoryId === cat.id ? "bg-hkd-pink text-white" : "text-hkd-cream/80 hover:bg-white/10"
            }`}
          >
            <span>{cat.name}</span>
            {!cat.active && <Badge tone="red">Archived</Badge>}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeCategoryId && (
          <div className="mb-3 flex items-center justify-between">
            <h1 className="font-display text-lg text-hkd-cream">{categories.find((c) => c.id === activeCategoryId)?.name}</h1>
            <div className="flex gap-2">
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  const cat = categories.find((c) => c.id === activeCategoryId)!;
                  toggleCategoryActive(cat);
                }}
              >
                {categories.find((c) => c.id === activeCategoryId)?.active ? "Archive Category" : "Reactivate Category"}
              </Button>
              <Button size="md" onClick={() => setNewProductOpen(true)}>
                + Product
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visibleProducts.map((product) => (
            <div key={product.id} className="rounded-xl border border-white/10 bg-hkd-charcoal p-3">
              <div className="flex gap-3">
                <label className="relative cursor-pointer">
                  <img
                    src={imageForProduct(product.name, categories.find((c) => c.id === product.categoryId)?.name, product.imagePath)}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(product, e)} />
                  <div className="absolute inset-0 grid place-items-center rounded-lg bg-black/40 text-xs font-bold text-white opacity-0 hover:opacity-100">
                    Change
                  </div>
                </label>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm text-hkd-cream">{product.name}</h3>
                    <Badge tone={product.active ? "green" : "red"}>{product.active ? "Active" : "Archived"}</Badge>
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {product.variants.map((variant) => (
                      <VariantRow key={variant.id} variant={variant} onSave={(price) => saveVariant(product.id, variant, price)} onToggle={() => toggleVariantActive(variant)} />
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="md" variant="secondary" onClick={() => addVariant(product.id)}>
                      + Variant
                    </Button>
                    <Button size="md" variant={product.active ? "danger" : "success"} onClick={() => toggleProductActive(product)}>
                      {product.active ? "Archive" : "Reactivate"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={newCategoryOpen} onClose={() => setNewCategoryOpen(false)} title="New Category">
        <div className="flex flex-col gap-3">
          <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name" className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <Button onClick={createCategory}>Create</Button>
        </div>
      </Modal>

      <Modal open={newProductOpen} onClose={() => setNewProductOpen(false)} title="New Product">
        <div className="flex flex-col gap-3">
          <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Product name" className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <label className="flex items-center gap-2 text-hkd-cream/70">
            <input type="checkbox" checked={newProduct.isPizza} onChange={(e) => setNewProduct({ ...newProduct, isPizza: e.target.checked })} className="h-5 w-5" />
            This is a pizza (used for size-based reporting)
          </label>
          <input value={newProduct.variantName} onChange={(e) => setNewProduct({ ...newProduct, variantName: e.target.value })} placeholder="First variant name (e.g. Regular, Small)" className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <input value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="Price (PKR)" className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <Button onClick={createProduct}>Create Product</Button>
        </div>
      </Modal>
    </div>
  );
}

function VariantRow({ variant, onSave, onToggle }: { variant: ProductVariant; onSave: (price: number) => void; onToggle: () => void }) {
  const [price, setPrice] = useState(String(variant.price));
  const dirty = Number(price) !== variant.price;
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
      <span className="w-24 shrink-0 text-sm text-hkd-cream/70">{variant.variantName}</span>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
        className="w-24 rounded-lg border border-white/10 bg-hkd-black px-2 py-1 text-hkd-cream"
      />
      <span className="text-xs text-hkd-cream/40">{formatPKR(variant.price)} now</span>
      {dirty && (
        <Button size="md" onClick={() => onSave(Number(price))} className="!px-3 !py-1.5 text-sm">
          Save
        </Button>
      )}
      <button onClick={onToggle} className="ml-auto">
        <Badge tone={variant.active ? "green" : "red"}>{variant.active ? "Active" : "Off"}</Badge>
      </button>
    </div>
  );
}
