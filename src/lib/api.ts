/* ------------------------------------------------------------------ */
/*  طبقة البيانات — كل الاتصال بـ Supabase يمر من هنا.                  */
/*  الأمان الحقيقي على الخادم (RLS + دوال SQL)، وليس في هذا الملف:     */
/*  حتى لو عدّل أحدهم هذا الكود في متصفحه لن يستطيع قراءة سعر المورد   */
/*  أو الطلبات أو تعديل المنتجات دون حساب مدير.                         */
/* ------------------------------------------------------------------ */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminProduct,
  Catalog,
  Category,
  City,
  Customer,
  DiscountCode,
  Order,
  OrderStatus,
  Payment,
  PaymentStatus,
  PlacedOrder,
  Product,
  ProductCost,
  Quote,
  SeasonalBanner,
  SiteSettings,
  Supplier,
} from "./data";

export interface CartItem {
  id: string;
  qty: number;
}

export interface PaymentInput {
  method: "cliq" | "cod";
  invoiceNo?: string;
  senderPhone?: string;
}

export interface Api {
  /** وضع التطوير بدون Supabase — بيانات تجريبية في الذاكرة */
  readonly mode: "supabase" | "dev-mock";

  getCatalog(): Promise<Catalog>;
  checkCode(code: string): Promise<number | null>;
  quote(items: CartItem[], code: string | null, city: string, student: boolean): Promise<Quote>;
  placeOrder(items: CartItem[], customer: Customer, payment: PaymentInput, code: string | null): Promise<PlacedOrder>;

  /* المصادقة */
  getSessionEmail(): Promise<string | null>;
  isAdmin(): Promise<boolean>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  onAuthChange(cb: () => void): () => void;

  /* الإدارة — يرفضها الخادم لغير المدير */
  admin: {
    listProducts(): Promise<AdminProduct[]>;
    saveProduct(p: Partial<Product> & { id?: string }, cost: ProductCost | null): Promise<string>;
    deleteProduct(id: string): Promise<void>;
    listSuppliers(): Promise<Supplier[]>;
    saveSupplier(s: Partial<Supplier>): Promise<void>;
    deleteSupplier(id: string): Promise<void>;
    listOrders(): Promise<{ orders: Order[]; payments: Payment[] }>;
    setOrderStatus(id: string, s: OrderStatus): Promise<void>;
    setPaymentStatus(id: string, s: PaymentStatus): Promise<void>;
    listCodes(): Promise<DiscountCode[]>;
    saveCode(c: DiscountCode): Promise<void>;
    deleteCode(code: string): Promise<void>;
    saveBanner(b: SeasonalBanner): Promise<void>;
  };
}

/* ------------------------- تحويل الصفوف ------------------------- */

type Row = Record<string, unknown>;
const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const optNum = (v: unknown) => (v === null || v === undefined ? undefined : Number(v));
const optStr = (v: unknown) => (v === null || v === undefined || v === "" ? undefined : String(v));

export const toCategory = (r: Row): Category => ({
  id: String(r.id),
  name: String(r.name),
  storeName: String(r.store_name),
  hint: String(r.hint ?? ""),
  color: String(r.color ?? "#c9b896"),
  sort: num(r.sort),
});

export const toProduct = (r: Row): Product => ({
  id: String(r.id),
  name: String(r.name),
  category: String(r.category),
  price: num(r.price),
  oldPrice: optNum(r.old_price),
  img: String(r.img),
  badge: optStr(r.badge),
  desc: String(r.description ?? ""),
  stock: num(r.stock),
  availability: r.availability === "on_order" ? "on_order" : "in_stock",
  prepDays: num(r.prep_days),
  isOriginalGuaranteed: r.is_original_guaranteed === true,
  active: r.active !== false,
  ratingAvg: r.rating_avg === null || r.rating_avg === undefined ? null : Number(r.rating_avg),
  ratingCount: num(r.rating_count),
});

const toBanner = (v: unknown): SeasonalBanner | null => {
  if (!v || typeof v !== "object") return null;
  const b = v as Row;
  return {
    enabled: b.enabled !== false,
    title: String(b.title ?? ""),
    subtitle: optStr(b.subtitle),
    ctaLabel: String(b.cta_label ?? "تسوّق الآن"),
    ctaHref: String(b.cta_href ?? "/products"),
  };
};

export const toSettings = (rows: Row[]): SiteSettings => {
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  return {
    freeDeliveryThreshold: Number(get("free_delivery_threshold") ?? 50),
    seasonalBanner: toBanner(get("seasonal_banner")),
  };
};

const toQuote = (q: Row): Quote => ({
  subtotal: num(q.subtotal),
  discount: num(q.discount),
  code: (q.code as string | null) ?? null,
  percent: num(q.percent),
  deliveryFee: num(q.delivery_fee),
  total: num(q.total),
});

const toOrder = (r: Row): Order => ({
  id: String(r.id),
  items: ((r.order_items as Row[]) ?? []).map((i) => ({
    id: String(i.product_id ?? i.id),
    name: String(i.name),
    price: num(i.unit_price),
    qty: num(i.qty),
    img: String(i.img ?? ""),
    discount: num(i.discount),
    supplierPrice: optNum(i.supplier_price),
    availability: i.availability === "on_order" ? "on_order" : "in_stock",
    prepDays: optNum(i.prep_days),
  })),
  subtotal: num(r.subtotal),
  discount: num(r.discount),
  code: optStr(r.code),
  deliveryFee: num(r.delivery_fee),
  total: num(r.total),
  customer: r.customer as Customer,
  paymentMethod: r.payment_method === "cliq" ? "cliq" : "cod",
  status: r.status as OrderStatus,
  createdAt: new Date(String(r.created_at)).getTime(),
});

const toPayment = (r: Row): Payment => ({
  id: String(r.id),
  orderId: String(r.order_id),
  invoiceNo: String(r.invoice_no),
  senderPhone: String(r.sender_phone),
  customerName: String(r.customer_name ?? ""),
  amount: num(r.amount),
  status: r.status as PaymentStatus,
  createdAt: new Date(String(r.created_at)).getTime(),
});

/* ------------------------- تنفيذ Supabase ------------------------- */

export function createSupabaseApi(sb: SupabaseClient): Api {
  const must = <T>(res: { data: T | null; error: { message: string } | null }): T => {
    if (res.error) throw new Error(res.error.message);
    return res.data as T;
  };

  return {
    mode: "supabase",

    async getCatalog() {
      const [cats, prods, cities, settings] = await Promise.all([
        sb.from("categories").select("*").order("sort"),
        sb.from("products").select("*").eq("active", true).order("created_at", { ascending: false }),
        sb.from("cities").select("*").order("sort"),
        sb.from("site_settings").select("*"),
      ]);
      return {
        categories: must(cats).map(toCategory),
        products: must(prods).map(toProduct),
        cities: must(cities).map((c: Row): City => ({ name: String(c.name), fee: num(c.fee) })),
        settings: toSettings(must(settings)),
      };
    },

    async checkCode(code) {
      const data = must(await sb.rpc("check_discount_code", { p_code: code }));
      return data === null ? null : Number(data);
    },

    async quote(items, code, city, student) {
      const data = must(await sb.rpc("quote_order", { p_items: items, p_code: code, p_city: city, p_student: student }));
      return toQuote(data as Row);
    },

    async placeOrder(items, customer, payment, code) {
      const data = must(
        await sb.rpc("place_order", {
          p_items: items,
          p_customer: customer,
          p_payment: { method: payment.method, invoice_no: payment.invoiceNo, sender_phone: payment.senderPhone },
          p_code: code,
        })
      ) as Row;
      return {
        ...toQuote(data),
        id: String(data.id),
        status: data.status as OrderStatus,
        maxPrepDays: num(data.max_prep_days),
        hasOnOrder: data.has_on_order === true,
      };
    },

    async getSessionEmail() {
      const { data } = await sb.auth.getSession();
      return data.session?.user.email ?? null;
    },
    async isAdmin() {
      const { data } = await sb.auth.getSession();
      if (!data.session) return false;
      const res = await sb.rpc("is_admin");
      return res.data === true;
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error("بيانات الدخول غير صحيحة");
    },
    async signOut() {
      await sb.auth.signOut();
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange(() => cb());
      return () => data.subscription.unsubscribe();
    },

    admin: {
      async listProducts() {
        const rows = must(
          await sb.from("products").select("*, product_costs(*)").order("created_at", { ascending: false })
        ) as Row[];
        return rows.map((r) => {
          const raw = r.product_costs as Row | Row[] | null;
          const c = Array.isArray(raw) ? raw[0] : raw;
          return {
            ...toProduct(r),
            cost: c
              ? { supplierPrice: num(c.supplier_price), supplierId: optStr(c.supplier_id), supplierUrl: optStr(c.supplier_url) }
              : null,
          };
        });
      },
      async saveProduct(p, cost) {
        const data = must(
          await sb.rpc("admin_save_product", {
            p: {
              id: p.id,
              name: p.name,
              category: p.category,
              price: p.price,
              old_price: p.oldPrice ?? null,
              img: p.img,
              badge: p.badge ?? null,
              description: p.desc ?? null,
              stock: p.stock,
              availability: p.availability,
              prep_days: p.prepDays,
              is_original_guaranteed: p.isOriginalGuaranteed,
              active: p.active,
            },
            c: cost
              ? { supplier_price: cost.supplierPrice, supplier_id: cost.supplierId ?? null, supplier_url: cost.supplierUrl ?? null }
              : null,
          })
        );
        return String(data);
      },
      async deleteProduct(id) {
        must(await sb.from("products").delete().eq("id", id));
      },
      async listSuppliers() {
        const rows = must(await sb.from("suppliers").select("*").order("created_at")) as Row[];
        return rows.map((r) => ({
          id: String(r.id),
          name: String(r.name),
          phone: optStr(r.phone),
          sourceUrl: optStr(r.source_url),
          notes: optStr(r.notes),
          active: r.active !== false,
        }));
      },
      async saveSupplier(s) {
        const row = { name: s.name, phone: s.phone ?? null, source_url: s.sourceUrl ?? null, notes: s.notes ?? null, active: s.active ?? true };
        if (s.id) must(await sb.from("suppliers").update(row).eq("id", s.id));
        else must(await sb.from("suppliers").insert(row));
      },
      async deleteSupplier(id) {
        must(await sb.from("suppliers").delete().eq("id", id));
      },
      async listOrders() {
        const [o, p] = await Promise.all([
          sb.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(300),
          sb.from("payments").select("*").order("created_at", { ascending: false }).limit(300),
        ]);
        return { orders: (must(o) as Row[]).map(toOrder), payments: (must(p) as Row[]).map(toPayment) };
      },
      async setOrderStatus(id, s) {
        must(await sb.from("orders").update({ status: s }).eq("id", id));
      },
      async setPaymentStatus(id, s) {
        must(await sb.from("payments").update({ status: s }).eq("id", id));
      },
      async listCodes() {
        const rows = must(await sb.from("discount_codes").select("*").order("created_at")) as Row[];
        return rows.map((r) => ({ code: String(r.code), percent: num(r.percent), active: r.active !== false }));
      },
      async saveCode(c) {
        must(await sb.from("discount_codes").upsert({ code: c.code.toUpperCase(), percent: c.percent, active: c.active }));
      },
      async deleteCode(code) {
        must(await sb.from("discount_codes").delete().eq("code", code));
      },
      async saveBanner(b) {
        must(
          await sb.from("site_settings").upsert({
            key: "seasonal_banner",
            value: { enabled: b.enabled, title: b.title, subtitle: b.subtitle ?? "", cta_label: b.ctaLabel, cta_href: b.ctaHref },
            updated_at: new Date().toISOString(),
          })
        );
      },
    },
  };
}
