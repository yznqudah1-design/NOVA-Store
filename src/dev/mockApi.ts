/* ------------------------------------------------------------------ */
/*  بيانات تجريبية للتطوير المحلي فقط (npm run dev بدون Supabase).     */
/*  لا يدخل هذا الملف في نسخة الإنتاج: يُحمَّل فقط داخل                 */
/*  `if (import.meta.env.DEV)` في supabase.ts.                          */
/*  دخول الإدارة التجريبي: أي بريد + كلمة المرور «dev».                 */
/* ------------------------------------------------------------------ */

import type { Api, CartItem } from "../lib/api";
import type {
  AdminProduct,
  Category,
  City,
  DiscountCode,
  Order,
  Payment,
  Quote,
  SiteSettings,
  Supplier,
} from "../lib/data";
import { novaFloor } from "../lib/pricing";

const img = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`;

const CATEGORIES: Category[] = [
  { id: "perfumes", name: "عطور رجالي", storeName: "Nova للعطور", hint: "تشكيلة عطور مختارة", color: "#c9b896", sort: 1 },
  { id: "electronics", name: "إلكترونيات", storeName: "Nova للإلكترونيات", hint: "أحدث الأجهزة والإكسسوارات", color: "#60a5fa", sort: 2 },
  { id: "fashion", name: "أزياء", storeName: "Nova للأزياء", hint: "ستايل يليق بك", color: "#f472b6", sort: 3 },
  { id: "grooming", name: "عناية رجالية", storeName: "Nova للعناية", hint: "أطقم وتفاصيل العناية اليومية", color: "#34d399", sort: 4 },
  { id: "stationery", name: "قرطاسية", storeName: "Nova للقرطاسية", hint: "دفاتر وأقلام وأدوات مدرسية ومكتبية", color: "#fbbf24", sort: 5 },
  { id: "printing", name: "طباعة وورق", storeName: "Nova للطباعة والورق", hint: "تجليد حراري A4، طباعة، ورق جوجو وورق A4", color: "#a78bfa", sort: 6 },
  { id: "umbrellas", name: "مظلات", storeName: "Nova للمظلات", hint: "مظلات عملية لموسم الشتاء", color: "#38bdf8", sort: 7 },
  { id: "mind-games", name: "ألعاب ذهنية", storeName: "Nova للألعاب الذهنية", hint: "شطرنج وبازل وألعاب تعليمية", color: "#fb923c", sort: 8 },
];

const CITIES: City[] = [
  ["عمّان", 2], ["إربد", 2.5], ["الزرقاء", 2.5], ["البلقاء", 3], ["جرش", 3], ["عجلون", 3],
  ["المفرق", 3], ["الكرك", 3], ["مادبا", 3], ["معان", 4], ["العقبة", 4],
].map(([name, fee]) => ({ name: name as string, fee: fee as number }));

type Seed = [id: string, name: string, cat: string, price: number, old: number | null, photo: number, badge: string | null, desc: string, stock: number, cost: number | null];
const SEED: Seed[] = [
  ["p1", "ديور سوفاج — أو دو برفان", "perfumes", 89, 110, 11216321, null, "100 مل — برغموت حاد وقلب من الفلفل والأمبروكسان.", 14, 70],
  ["p2", "شانيل بلو دو شانيل", "perfumes", 95, null, 7850600, null, "100 مل — خشبي أروماتيك أنيق.", 9, null],
  ["p3", "أرماني كود بروفومو", "perfumes", 69, 82, 29805437, null, "110 مل — عطر سهرة شرقي.", 11, 60],
  ["p4", "باكو رابان ون مليون", "perfumes", 59, null, 16239693, "عرض خاص", "100 مل — جريب فروت وقرفة وعنبر.", 17, null],
  ["e1", "سماعات NovaBuds برو — عزل ضوضاء", "electronics", 39, 55, 33936400, "خصم 29%", "بلوتوث 5.3، بطارية 30 ساعة.", 22, 25],
  ["e2", "ساعة ذكية Ultra بشاشة أموليد", "electronics", 89, null, 39076652, null, "شاشة أموليد، مقاومة للماء IP68.", 15, null],
  ["e3", "مكبر صوت كلاسيك بصوت ستيريو", "electronics", 45, null, 14941998, null, "قدرة 40 واط، 18 ساعة تشغيل.", 0, 37],
  ["e4", "بنك طاقة 20000mAh شحن سريع", "electronics", 19, 25, 4072683, null, "شحن سريع 22.5W.", 30, null],
  ["f1", "سنيكرز كلاسيك أبيض بكعب أزرق", "fashion", 45, null, 11292946, "جديد", "متوفر بالقياسات 40–45.", 18, null],
  ["g1", "طقم عناية باللحية — 6 قطع", "grooming", 27, null, 14649387, null, "زيت لحية، بلسم، شامبو، مشط ومقص.", 16, null],
];

let products: AdminProduct[] = SEED.map(([id, name, category, price, old, photo, badge, desc, stock, cost]) => ({
  id, name, category, price, oldPrice: old ?? undefined, img: img(photo), badge: badge ?? undefined, desc, stock,
  availability: id === "e3" ? "on_order" : "in_stock",
  prepDays: id === "e3" ? 3 : 1,
  isOriginalGuaranteed: id === "p1",
  active: true,
  ratingAvg: id === "p1" ? 4.5 : null,
  ratingCount: id === "p1" ? 2 : 0,
  cost: cost ? { supplierPrice: cost, supplierId: "sup-1" } : null,
}));

let suppliers: Supplier[] = [{ id: "sup-1", name: "مورد تجريبي (فيسبوك)", phone: "0790000000", sourceUrl: "https://facebook.com/", active: true }];
let codes: DiscountCode[] = [{ code: "NOVA10", percent: 10, active: true }, { code: "WELCOME15", percent: 15, active: true }];
let orders: Order[] = [];
let payments: Payment[] = [];
let settings: SiteSettings = {
  freeDeliveryThreshold: 50,
  seasonalBanner: {
    enabled: true,
    title: "الشتاء وصل ☔ — تشكيلة المظلات الآن في Nova",
    subtitle: "مظلات عملية لموسم الشتاء، بأسعار الدينار وتوصيل لكل المحافظات.",
    ctaLabel: "تسوّق المظلات",
    ctaHref: "/products?cat=umbrellas",
  },
};
let admin = false;
const listeners = new Set<() => void>();
const delay = <T>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120));
const publicProduct = ({ cost: _c, ...p }: AdminProduct) => p;

function compute(items: CartItem[], code: string | null, city: string, student: boolean) {
  const c = codes.find((x) => x.code === (code ?? "").trim().toUpperCase() && x.active);
  const percent = c?.percent ?? 0;
  const lines = items.map((it) => {
    const p = products.find((x) => x.id === it.id && x.active);
    if (!p) throw new Error("UNKNOWN_PRODUCT: أحد المنتجات لم يعد متوفرًا — حدّث السلة");
    if (p.availability === "in_stock" && p.stock < it.qty) throw new Error(`OUT_OF_STOCK: الكمية المطلوبة من «${p.name}» غير متوفرة حاليًا`);
    let d = Math.round(p.price * it.qty * percent) / 100;
    if (p.cost) d = Math.min(d, Math.max(0, (p.price - novaFloor(p.cost.supplierPrice)) * it.qty));
    return { p, qty: it.qty, discount: d };
  });
  const fee0 = CITIES.find((x) => x.name === city)?.fee;
  if (fee0 === undefined) throw new Error("BAD_CITY: المحافظة غير معروفة");
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const discount = Math.round(lines.reduce((s, l) => s + l.discount, 0) * 100) / 100;
  const deliveryFee = student || subtotal - discount >= settings.freeDeliveryThreshold ? 0 : fee0;
  const quote: Quote = { subtotal, discount, code: c ? c.code : null, percent, deliveryFee, total: subtotal - discount + deliveryFee };
  return { quote, lines };
}

export function createMockApi(): Api {
  console.info("[NOVA] وضع التطوير: بيانات تجريبية في الذاكرة. دخول الإدارة: أي بريد + كلمة المرور dev");
  return {
    mode: "dev-mock",
    getCatalog: () =>
      delay({ categories: CATEGORIES, products: products.filter((p) => p.active).map(publicProduct), cities: CITIES, settings }),
    checkCode: async (code) => codes.find((c) => c.code === code.trim().toUpperCase() && c.active)?.percent ?? null,
    quote: async (items, code, city, student) => compute(items, code, city, student).quote,
    async placeOrder(items, customer, payment, code) {
      if (!/^07\d{8}$/.test(customer.phone)) throw new Error("BAD_PHONE: رقم الهاتف غير صحيح");
      const student = !!customer.university || /جامع/.test(customer.notes ?? "");
      const { quote, lines } = compute(items, code, customer.city, student);
      const id = `NV-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      const status = payment.method === "cliq" ? "بانتظار الدفع" : "قيد التجهيز";
      orders = [{
        id, customer, paymentMethod: payment.method, status, createdAt: Date.now(),
        subtotal: quote.subtotal, discount: quote.discount, code: quote.code ?? undefined, deliveryFee: quote.deliveryFee, total: quote.total,
        items: lines.map((l) => ({ id: l.p.id, name: l.p.name, price: l.p.price, qty: l.qty, img: l.p.img, discount: l.discount, supplierPrice: l.p.cost?.supplierPrice, availability: l.p.availability, prepDays: l.p.prepDays })),
      }, ...orders];
      lines.forEach((l) => { if (l.p.availability === "in_stock") l.p.stock -= l.qty; });
      if (payment.method === "cliq")
        payments = [{ id: `pay-${Date.now()}`, orderId: id, invoiceNo: payment.invoiceNo ?? "", senderPhone: payment.senderPhone ?? "", customerName: customer.name, amount: quote.total, status: "pending", createdAt: Date.now() }, ...payments];
      return delay({ ...quote, id, status, maxPrepDays: Math.max(...lines.map((l) => l.p.prepDays)), hasOnOrder: lines.some((l) => l.p.availability === "on_order") });
    },
    getSessionEmail: async () => (admin ? "dev@nova.local" : null),
    isAdmin: async () => admin,
    async signIn(_email, password) {
      if (password !== "dev") throw new Error("بيانات الدخول غير صحيحة");
      admin = true;
      listeners.forEach((l) => l());
    },
    async signOut() {
      admin = false;
      listeners.forEach((l) => l());
    },
    onAuthChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    admin: {
      listProducts: () => delay(products.map((p) => ({ ...p }))),
      async saveProduct(p, cost) {
        if (cost && p.price !== undefined && p.price < novaFloor(cost.supplierPrice))
          throw new Error(`PRICE_BELOW_FLOOR: السعر أقل من الحد الأدنى ${novaFloor(cost.supplierPrice).toFixed(2)}`);
        const id = p.id || `p-${Date.now().toString(36)}`;
        const existing = products.find((x) => x.id === id);
        const next = { ...(existing ?? { ratingAvg: null, ratingCount: 0 }), ...p, id, cost } as AdminProduct;
        products = existing ? products.map((x) => (x.id === id ? next : x)) : [next, ...products];
        return id;
      },
      async deleteProduct(id) { products = products.filter((p) => p.id !== id); },
      listSuppliers: () => delay([...suppliers]),
      async saveSupplier(s) {
        if (s.id) suppliers = suppliers.map((x) => (x.id === s.id ? { ...x, ...s } as Supplier : x));
        else suppliers = [...suppliers, { id: `sup-${Date.now()}`, name: s.name ?? "", phone: s.phone, sourceUrl: s.sourceUrl, notes: s.notes, active: true }];
      },
      async deleteSupplier(id) { suppliers = suppliers.filter((s) => s.id !== id); },
      listOrders: () => delay({ orders: [...orders], payments: [...payments] }),
      async setOrderStatus(id, s) { orders = orders.map((o) => (o.id === id ? { ...o, status: s } : o)); },
      async setPaymentStatus(id, s) {
        const pay = payments.find((p) => p.id === id);
        payments = payments.map((p) => (p.id === id ? { ...p, status: s } : p));
        if (pay && s === "approved") orders = orders.map((o) => (o.id === pay.orderId && o.status === "بانتظار الدفع" ? { ...o, status: "قيد التجهيز" } : o));
      },
      listCodes: () => delay([...codes]),
      async saveCode(c) { codes = [...codes.filter((x) => x.code !== c.code), c]; },
      async deleteCode(code) { codes = codes.filter((c) => c.code !== code); },
      async saveBanner(b) { settings = { ...settings, seasonalBanner: b }; },
    },
  };
}
