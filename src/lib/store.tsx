import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CODES_SEED,
  ORDERS_SEED,
  PAYMENTS_SEED,
  PRODUCTS,
  SELLERS_SEED,
} from "./data";
import type {
  DiscountCode,
  Order,
  Payment,
  PaymentStatus,
  Product,
  Seller,
} from "./data";

/* ---------------- حالة دائمة في localStorage ---------------- */

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

/* ------------------------- الأنواع ------------------------- */

export interface CartLine {
  id: string;
  qty: number;
}

interface ShopCtx {
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  cart: CartLine[];
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;

  wishlist: string[];
  toggleWish: (id: string) => void;

  codes: DiscountCode[];
  addCode: (c: DiscountCode) => void;
  removeCode: (code: string) => void;
  toggleCode: (code: string) => void;

  orders: Order[];
  placeOrder: (o: Order) => void;
  setOrderStatus: (id: string, s: Order["status"]) => void;

  payments: Payment[];
  addPayment: (p: Payment) => void;
  setPaymentStatus: (id: string, s: PaymentStatus) => void;

  sellers: Seller[];
  toggleSeller: (id: string) => void;
  addSeller: (s: Seller) => string | null;
  removeSeller: (id: string) => void;

  sellerId: string | null;
  currentSeller: Seller | null;
  sellerLogin: (username: string, password: string) => { ok: boolean; msg: string };
  sellerLogout: () => void;

  adminAuthed: boolean;
  adminLogin: (ok: boolean) => void;

  customer: { name: string; phone: string } | null;
  setCustomer: (c: { name: string; phone: string } | null) => void;

  toasts: { id: number; msg: string }[];
  notify: (msg: string) => void;
}

const Ctx = createContext<ShopCtx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = usePersistent<Product[]>("nova_products", PRODUCTS);
  const [sellerId, setSellerId] = usePersistent<string | null>("nova_seller", null);
  const [cart, setCart] = usePersistent<CartLine[]>("nova_cart", []);
  const [wishlist, setWishlist] = usePersistent<string[]>("nova_wish", []);
  const [codes, setCodes] = usePersistent<DiscountCode[]>("nova_codes", CODES_SEED);
  const [orders, setOrders] = usePersistent<Order[]>("nova_orders", ORDERS_SEED);
  const [payments, setPayments] = usePersistent<Payment[]>("nova_payments", PAYMENTS_SEED);
  /* v2: أضيفت حقول اسم الدخول وكلمة المرور للبائعين */
  const [sellers, setSellers] = usePersistent<Seller[]>("nova_sellers_v2", SELLERS_SEED);
  const [adminAuthed, setAdminAuthed] = usePersistent<boolean>("nova_admin", false);
  const [customer, setCustomer] = usePersistent<{ name: string; phone: string } | null>(
    "nova_customer",
    null
  );
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const notify = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  };

  const addToCart = (id: string, qty = 1) => {
    setCart((c) => {
      const line = c.find((l) => l.id === id);
      if (line) return c.map((l) => (l.id === id ? { ...l, qty: Math.min(9, l.qty + qty) } : l));
      return [...c, { id, qty }];
    });
    notify("تمت الإضافة إلى السلة");
  };
  const removeFromCart = (id: string) => setCart((c) => c.filter((l) => l.id !== id));
  const setQty = (id: string, qty: number) =>
    setCart((c) =>
      qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty: Math.min(9, qty) } : l))
    );
  const clearCart = () => setCart([]);

  const toggleWish = (id: string) => {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
    notify(wishlist.includes(id) ? "أُزيل من المفضلة" : "أُضيف إلى المفضلة");
  };

  const currentSeller = sellers.find((s) => s.id === sellerId) ?? null;

  const value = useMemo<ShopCtx>(
    () => ({
      products,
      addProduct: (p) => {
        setProducts((ps) => [p, ...ps]);
        notify("تمت إضافة المنتج");
      },
      updateProduct: (id, patch) => {
        setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
        notify("تم حفظ التعديلات");
      },
      deleteProduct: (id) => {
        setProducts((ps) => ps.filter((p) => p.id !== id));
        setCart((c) => c.filter((l) => l.id !== id));
        notify("تم حذف المنتج");
      },
      cart,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      wishlist,
      toggleWish,
      codes,
      addCode: (c) => {
        setCodes((cs) => [...cs.filter((x) => x.code !== c.code), c]);
        notify("تم حفظ كود الخصم");
      },
      removeCode: (code) => {
        setCodes((cs) => cs.filter((x) => x.code !== code));
        notify("تم حذف الكود");
      },
      toggleCode: (code) =>
        setCodes((cs) => cs.map((x) => (x.code === code ? { ...x, active: !x.active } : x))),
      orders,
      placeOrder: (o) => setOrders((os) => [o, ...os]),
      setOrderStatus: (id, s) => {
        setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: s } : o)));
        notify("تم تحديث حالة الطلب");
      },
      payments,
      addPayment: (p) => setPayments((ps) => [p, ...ps]),
      setPaymentStatus: (id, s) => {
        setPayments((ps) => ps.map((p) => (p.id === id ? { ...p, status: s } : p)));
        setOrders((os) =>
          os.map((o) =>
            o.id === payments.find((p) => p.id === id)?.orderId && s === "approved"
              ? { ...o, status: "قيد التجهيز" }
              : o
          )
        );
        notify(s === "approved" ? "تم اعتماد الدفعة" : "تم رفض الدفعة");
      },
      sellers,
      toggleSeller: (id) =>
        setSellers((ss) => ss.map((s) => (s.id === id ? { ...s, active: !s.active } : s))),
      addSeller: (s) => {
        const u = s.username.trim().toLowerCase();
        if (sellers.some((x) => (x.username ?? "").toLowerCase() === u)) return "اسم الدخول مستخدم مسبقًا";
        if (sellers.some((x) => x.store.trim() === s.store.trim())) return "اسم المتجر مستخدم مسبقًا";
        setSellers((ss) => [...ss, { ...s, username: u }]);
        notify(`تمت إضافة البائع «${s.store}»`);
        return null;
      },
      removeSeller: (id) => {
        const target = sellers.find((s) => s.id === id);
        setSellers((ss) => ss.filter((s) => s.id !== id));
        if (target) setProducts((ps) => ps.filter((p) => p.seller !== target.store));
        if (sellerId === id) setSellerId(null);
        notify("تم حذف البائع ومنتجاته");
      },
      sellerId,
      currentSeller,
      sellerLogin: (username, password) => {
        const u = username.trim().toLowerCase();
        const s = sellers.find(
          (x) => (x.username ?? "").toLowerCase() === u && x.password === password
        );
        if (!s) return { ok: false, msg: "اسم الدخول أو كلمة المرور غير صحيحة" };
        if (!s.active) return { ok: false, msg: "حساب هذا المتجر موقوف — راجع إدارة NOVA" };
        setSellerId(s.id);
        notify(`أهلًا بمتجر ${s.store}`);
        return { ok: true, msg: "" };
      },
      sellerLogout: () => setSellerId(null),
      adminAuthed,
      adminLogin: (ok) => setAdminAuthed(ok),
      customer,
      setCustomer,
      toasts,
      notify,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, cart, wishlist, codes, orders, payments, sellers, sellerId, currentSeller, adminAuthed, customer, toasts]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop خارج ShopProvider");
  return ctx;
}
