/* ------------------------------------------------------------------ */
/*  ثوابت وأنواع NOVA STORE                                            */
/*  البيانات الفعلية (منتجات، طلبات، أكواد…) في Supabase — انظر api.ts */
/*  لا تضع هنا أي كلمة مرور أو مفتاح سري أو سعر مورد.                   */
/* ------------------------------------------------------------------ */

export const WHATSAPP = "0777504658";
export const WHATSAPP_INTL = "962777504658";
export const EMAIL = "novastorejo@gmail.com";
export const CLIQ_ALIAS = "Nova962";

export const jod = (n: number) => `${n.toFixed(2)} د.أ`;

/** رسالة واتساب الجاهزة للموردين */
export const SUPPLIER_WA_TEXT = "أرغب بأن أكون مورداً لـ NOVA STORE";

export const UNIVERSITIES = [
  "جامعة العلوم والتكنولوجيا الأردنية (JUST)",
  "جامعة اليرموك (YU)",
  "جامعة أردنية أخرى",
];

/* ------------------------- الكتالوج ------------------------- */

export interface Category {
  id: string;
  name: string;
  /** اسم المتجر الفرعي، مثل «Nova للعطور» */
  storeName: string;
  hint: string;
  color: string;
  sort: number;
}

export type Availability = "in_stock" | "on_order";

/** المنتج كما يراه الزبون — لا يحتوي سعر المورد أبدًا */
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  img: string;
  badge?: string;
  desc: string;
  stock: number;
  availability: Availability;
  prepDays: number;
  isOriginalGuaranteed: boolean;
  active: boolean;
  /** متوسط التقييمات الحقيقية — فارغ إن لم توجد */
  ratingAvg: number | null;
  ratingCount: number;
}

export interface City {
  name: string;
  fee: number;
}

export interface SeasonalBanner {
  enabled: boolean;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface SiteSettings {
  freeDeliveryThreshold: number;
  seasonalBanner: SeasonalBanner | null;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  cities: City[];
  settings: SiteSettings;
}

/* ------------------------- بيانات المدير فقط ------------------------- */

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  sourceUrl?: string;
  notes?: string;
  active: boolean;
}

export interface ProductCost {
  supplierPrice: number;
  supplierId?: string;
  supplierUrl?: string;
}

export interface AdminProduct extends Product {
  cost: ProductCost | null;
}

export interface DiscountCode {
  code: string;
  percent: number;
  active: boolean;
}

/* ------------------------- الطلبات والدفعات ------------------------- */

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface Payment {
  id: string;
  orderId: string;
  invoiceNo: string;
  senderPhone: string;
  customerName: string;
  amount: number;
  status: PaymentStatus;
  createdAt: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
  discount: number;
  supplierPrice?: number;
  availability?: Availability;
  prepDays?: number;
}

export type OrderStatus = "بانتظار الدفع" | "قيد التجهيز" | "قيد التوصيل" | "مكتمل" | "ملغي";

export interface Customer {
  name: string;
  phone: string;
  city: string;
  address: string;
  university?: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  code?: string;
  deliveryFee: number;
  total: number;
  customer: Customer;
  paymentMethod: "cliq" | "cod";
  status: OrderStatus;
  createdAt: number;
}

export const ORDER_STATUSES: OrderStatus[] = ["بانتظار الدفع", "قيد التجهيز", "قيد التوصيل", "مكتمل", "ملغي"];

/** عرض سعر من الخادم (السلة/صفحة الدفع) */
export interface Quote {
  subtotal: number;
  discount: number;
  code: string | null;
  percent: number;
  deliveryFee: number;
  total: number;
}

export interface PlacedOrder extends Quote {
  id: string;
  status: OrderStatus;
  maxPrepDays: number;
  hasOnOrder: boolean;
}

/* ------------------------- أدوات ------------------------- */

export const availabilityLabel = (p: Pick<Product, "availability" | "prepDays">) =>
  p.availability === "in_stock"
    ? "متوفر — توصيل خلال 1-2 يوم"
    : `عند الطلب — يُجهّز خلال ${p.prepDays} ${p.prepDays === 1 ? "يوم" : p.prepDays === 2 ? "يومين" : "أيام"}`;

export const timeAgo = (ts: number) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  return `قبل ${Math.floor(h / 24)} يوم`;
};

/** رسالة الخطأ من الخادم بدون الرمز التقني، مثل «BAD_PHONE: ...» */
export const cleanError = (e: unknown) => {
  const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
  return msg.replace(/^[A-Z_]+:\s*/, "");
};

/* ---------------- توقيت الأردن (Asia/Amman) ---------------- */

export const MONTHS_AR = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول",
];

const jordanParts = (ts: number) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Amman",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date(ts));
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);
  return { y, m };
};

/** مفتاح الشهر بتوقيت عمّان، مثل "2026-11" */
export const jordanMonthKey = (ts: number) => {
  const { y, m } = jordanParts(ts);
  return `${y}-${String(m).padStart(2, "0")}`;
};

/** اسم الشهر بالعربية مع السنة، مثل "تشرين الثاني 2026" */
export const jordanMonthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_AR[m - 1]} ${y}`;
};

export const nextMonthKey = (key: string) => {
  let [y, m] = key.split("-").map(Number);
  m += 1;
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
};

export const prevMonthKey = (key: string) => {
  let [y, m] = key.split("-").map(Number);
  m -= 1;
  if (m < 1) { m = 12; y -= 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
};
