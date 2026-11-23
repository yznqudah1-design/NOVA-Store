import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Category, City, Product, SiteSettings } from "./data";
import { cleanError } from "./data";
import type { Api } from "./api";
import { loadApi } from "./supabase";

/* ------- حالة المتصفح فقط (سلة، مفضلة، بيانات الزبون) — ليست بيانات حساسة ------- */

function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* تجاهل */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export interface CartLine {
  id: string;
  qty: number;
}

type Status = "loading" | "ready" | "error" | "unconfigured";

interface ShopCtx {
  api: Api | null;
  status: Status;
  loadError: string;
  reloadCatalog: () => Promise<void>;

  categories: Category[];
  products: Product[];
  cities: City[];
  settings: SiteSettings;
  categoryOf: (id: string) => Category | undefined;
  storeNameOf: (p: Product) => string;

  cart: CartLine[];
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;

  wishlist: string[];
  toggleWish: (id: string) => void;

  isAdmin: boolean;
  adminEmail: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  customer: { name: string; phone: string } | null;
  setCustomer: (c: { name: string; phone: string } | null) => void;

  toasts: { id: number; msg: string }[];
  notify: (msg: string) => void;
}

const Ctx = createContext<ShopCtx | null>(null);

const DEFAULT_SETTINGS: SiteSettings = { freeDeliveryThreshold: 50, seasonalBanner: null };

export function ShopProvider({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<Api | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [loadError, setLoadError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const [cart, setCart] = usePersistent<CartLine[]>("nova_cart", []);
  const [wishlist, setWishlist] = usePersistent<string[]>("nova_wish", []);
  const [customer, setCustomer] = usePersistent<{ name: string; phone: string } | null>("nova_customer", null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  /* تنظيف مفاتيح النسخة القديمة التي كانت تحفظ كل شيء في المتصفح */
  useEffect(() => {
    try {
      ["nova_products", "nova_seller", "nova_codes", "nova_orders", "nova_payments", "nova_sellers_v2", "nova_admin"].forEach((k) =>
        localStorage.removeItem(k)
      );
    } catch {
      /* تجاهل */
    }
  }, []);

  const notify = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const fetchCatalog = useCallback(async (a: Api) => {
    try {
      const c = await a.getCatalog();
      setCategories(c.categories);
      setProducts(c.products);
      setCities(c.cities);
      setSettings(c.settings);
      setStatus("ready");
    } catch (e) {
      setLoadError(cleanError(e));
      setStatus("error");
    }
  }, []);

  const refreshAuth = useCallback(async (a: Api) => {
    const [email, admin] = await Promise.all([a.getSessionEmail(), a.isAdmin()]);
    setAdminEmail(email);
    setIsAdmin(admin);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    loadApi().then((a) => {
      if (!a) {
        setStatus("unconfigured");
        return;
      }
      setApi(a);
      fetchCatalog(a);
      refreshAuth(a);
      unsub = a.onAuthChange(() => refreshAuth(a));
    });
    return () => unsub?.();
  }, [fetchCatalog, refreshAuth]);

  /* إزالة منتجات لم تعد موجودة من السلة */
  useEffect(() => {
    if (status !== "ready") return;
    setCart((c) => c.filter((l) => products.some((p) => p.id === l.id)));
  }, [status, products, setCart]);

  const value = useMemo<ShopCtx>(() => {
    const categoryOf = (id: string) => categories.find((c) => c.id === id);
    return {
      api,
      status,
      loadError,
      reloadCatalog: async () => {
        if (api) await fetchCatalog(api);
      },
      categories,
      products,
      cities,
      settings,
      categoryOf,
      storeNameOf: (p) => categoryOf(p.category)?.storeName ?? "Nova",

      cart,
      addToCart: (id, qty = 1) => {
        setCart((c) => {
          const line = c.find((l) => l.id === id);
          if (line) return c.map((l) => (l.id === id ? { ...l, qty: Math.min(9, l.qty + qty) } : l));
          return [...c, { id, qty: Math.min(9, qty) }];
        });
        notify("تمت الإضافة إلى السلة");
      },
      removeFromCart: (id) => setCart((c) => c.filter((l) => l.id !== id)),
      setQty: (id, qty) =>
        setCart((c) =>
          qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty: Math.min(9, qty) } : l))
        ),
      clearCart: () => setCart([]),
      cartCount: cart.reduce((s, l) => s + l.qty, 0),

      wishlist,
      toggleWish: (id) => {
        notify(wishlist.includes(id) ? "أُزيل من المفضلة" : "أُضيف إلى المفضلة");
        setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
      },

      isAdmin,
      adminEmail,
      signIn: async (email, password) => {
        if (!api) throw new Error("الخادم غير متاح");
        await api.signIn(email, password);
        await refreshAuth(api);
      },
      signOut: async () => {
        if (!api) return;
        await api.signOut();
        setIsAdmin(false);
        setAdminEmail(null);
      },

      customer,
      setCustomer,
      toasts,
      notify,
    };
  }, [api, status, loadError, categories, products, cities, settings, cart, wishlist, isAdmin, adminEmail, customer, toasts, fetchCatalog, refreshAuth, notify, setCart, setWishlist, setCustomer]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop خارج ShopProvider");
  return ctx;
}
