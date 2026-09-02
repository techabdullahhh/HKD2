import { create } from "zustand";
import type { Category, Deal, Product } from "@shared/types";

interface CatalogState {
  categories: Category[];
  products: Product[];
  deals: Deal[];
  loading: boolean;
  loaded: boolean;
  fetchAll(includeInactive?: boolean): Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  categories: [],
  products: [],
  deals: [],
  loading: false,
  loaded: false,

  async fetchAll(includeInactive = false) {
    set({ loading: true });
    const [categories, products, deals] = await Promise.all([
      window.hkd.catalog.categories(includeInactive),
      window.hkd.catalog.products(includeInactive),
      window.hkd.catalog.deals(includeInactive)
    ]);
    set({ categories, products, deals, loading: false, loaded: true });
  }
}));
