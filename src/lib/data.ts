/* ------------------------------------------------------------------ */
/*  بيانات NOVA STORE — المتجر الأردني متعدد البائعين                  */
/* ------------------------------------------------------------------ */

export const WHATSAPP = "0777504658";
export const WHATSAPP_INTL = "962777504658";
export const EMAIL = "novastorejo@gmail.com";
export const CLIQ_ALIAS = "Nova962";

/** الإطلاق الرسمي: 1/11/2026 الساعة 7:00 مساءً بتوقيت عمّان (UTC+3) */
export const LAUNCH_TS = Date.UTC(2026, 10, 1, 16, 0, 0);

export const ADMIN_EMAIL = "admin@nova.jo";
export const ADMIN_PASS = "NOVA2026";

export const jod = (n: number) => `${n.toFixed(2)} د.أ`;

export const FREE_DELIVERY_THRESHOLD = 50;

/* ------------------------- التصنيفات ------------------------- */

export const CATEGORIES = [
  { id: "perfumes", name: "عطور رجالي", hint: "تشكيلة عطور ألفا الأصلية" },
  { id: "electronics", name: "إلكترونيات", hint: "أحدث الأجهزة والإكسسوارات" },
  { id: "fashion", name: "أزياء", hint: "ستايل يليق بك" },
  { id: "grooming", name: "عناية رجالية", hint: "أطقم وتفاصيل الجنتلمان" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/* ------------------------- المنتجات ------------------------- */

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  img: string;
  seller: string;
  badge?: string;
  desc: string;
  stock: number;
}

export const PRODUCTS: Product[] = [
  /* ---- عطور ألفا — رجالي ---- */
  {
    id: "p1", name: "ديور سوفاج — أو دو برفان", category: "perfumes",
    price: 89, oldPrice: 110, rating: 4.9, reviews: 214, seller: "عطور ألفا",
    img: "https://images.pexels.com/photos/11216321/pexels-photo-11216321.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    badge: "الأكثر مبيعًا", stock: 14,
    desc: "100 مل — توقيع العطور الرجالية الحديثة: برغموت حاد وقلب من الفلفل والأمبروكسان يدوم طوال اليوم.",
  },
  {
    id: "p2", name: "شانيل بلو دو شانيل", category: "perfumes",
    price: 95, rating: 4.8, reviews: 167, seller: "عطور ألفا",
    img: "https://images.pexels.com/photos/7850600/pexels-photo-7850600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 9,
    desc: "100 مل — خشبي أروماتيك أنيق: حمضيات منعشة على قاعدة من خشب الصندل واللبان.",
  },
  {
    id: "p3", name: "أرماني كود بروفومو", category: "perfumes",
    price: 69, oldPrice: 82, rating: 4.7, reviews: 98, seller: "عطور ألفا",
    img: "https://images.pexels.com/photos/29805437/pexels-photo-29805437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 11,
    desc: "110 مل — عطر سهرة شرقي: حبهان ولافندر مع قلب دافئ من حبوب التونكا.",
  },
  {
    id: "p4", name: "باكو رابان ون مليون", category: "perfumes",
    price: 59, rating: 4.7, reviews: 143, seller: "عطور ألفا",
    img: "https://images.pexels.com/photos/16239693/pexels-photo-16239693.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    badge: "عرض خاص", stock: 17,
    desc: "100 مل — القارورة الذهبية الشهيرة: جريب فروت وقرفة وعنبر بشخصية لا تُنسى.",
  },
  {
    id: "p5", name: "أرماني أكوا دي جيو بروفومو", category: "perfumes",
    price: 72, rating: 4.8, reviews: 121, seller: "عطور ألفا",
    img: "https://images.pexels.com/photos/36779953/pexels-photo-36779953.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 8,
    desc: "75 مل — نسيم البحر بطابع فاخر: نوتات بحرية مع باتشولي ولبان.",
  },
  {
    id: "p6", name: "باكو رابان إنفكتوس", category: "perfumes",
    price: 63, rating: 4.6, reviews: 87, seller: "عطور ألفا",
    img: "https://images.pexels.com/photos/15096784/pexels-photo-15096784.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 13,
    desc: "100 مل — كأس الأبطال: غريب فروت وغواياك بروح رياضية منعشة.",
  },
  {
    id: "p7", name: "إيف سان لوران واي", category: "perfumes",
    price: 75, rating: 4.8, reviews: 156, seller: "عطور ألفا",
    img: "https://images.pexels.com/photos/36779955/pexels-photo-36779955.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 10,
    desc: "100 مل — جرعة الثقة اليومية: زنجبيل وتفاح أخضر على قاعدة أمبروكسان.",
  },
  {
    id: "p8", name: "فيكتور آند رولف سبايس بومب", category: "perfumes",
    price: 66, oldPrice: 78, rating: 4.7, reviews: 76, seller: "عطور ألفا",
    img: "https://images.pexels.com/photos/26859235/pexels-photo-26859235.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 7,
    desc: "90 مل — قنبلة التوابل: فلفل وقرفة وتبغ؛ دفء الخريف في زجاجة.",
  },

  /* ---- إلكترونيات ---- */
  {
    id: "e1", name: "سماعات NovaBuds برو — عزل ضوضاء", category: "electronics",
    price: 39, oldPrice: 55, rating: 4.8, reviews: 342, seller: "تك زون الأردن",
    img: "https://images.pexels.com/photos/33936400/pexels-photo-33936400.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    badge: "خصم 29%", stock: 22,
    desc: "بلوتوث 5.3، بطارية 30 ساعة مع العلبة، ميكروفونات مزدوجة للمكالمات.",
  },
  {
    id: "e2", name: "ساعة ذكية Ultra بشاشة أموليد", category: "electronics",
    price: 89, rating: 4.7, reviews: 188, seller: "تك زون الأردن",
    img: "https://images.pexels.com/photos/39076652/pexels-photo-39076652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 15,
    desc: "شاشة 1.96 إنش أموليد، قياس نبض وأكسجين، مقاومة للماء IP68، بطارية 10 أيام.",
  },
  {
    id: "e3", name: "مكبر صوت كلاسيك بصوت ستيريو", category: "electronics",
    price: 45, rating: 4.6, reviews: 94, seller: "تك زون الأردن",
    img: "https://images.pexels.com/photos/14941998/pexels-photo-14941998.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 12,
    desc: "تصميم كلاسيكي أنيق، قدرة 40 واط، 18 ساعة تشغيل، يدعم AUX وبلوتوث.",
  },
  {
    id: "e4", name: "بنك طاقة 20000mAh شحن سريع", category: "electronics",
    price: 19, oldPrice: 25, rating: 4.5, reviews: 256, seller: "تك زون الأردن",
    img: "https://images.pexels.com/photos/4072683/pexels-photo-4072683.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 30,
    desc: "شحن سريع 22.5W، منفذا USB + Type-C، شاشة عرض نسبة البطارية.",
  },

  /* ---- أزياء ---- */
  {
    id: "f1", name: "سنيكرز كلاسيك أبيض بكعب أزرق", category: "fashion",
    price: 45, rating: 4.7, reviews: 132, seller: "فاشن هب",
    img: "https://images.pexels.com/photos/11292946/pexels-photo-11292946.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    badge: "جديد", stock: 18,
    desc: "جلد صناعي فاخر ونعل مطاطي مريح، متوفر بالقياسات 40–45.",
  },
  {
    id: "f2", name: "حقيبة ظهر جلدية للسفر", category: "fashion",
    price: 35, rating: 4.6, reviews: 88, seller: "فاشن هب",
    img: "https://images.pexels.com/photos/13870707/pexels-photo-13870707.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 10,
    desc: "جيوب متعددة وجيب لابتوب 15 إنش، خامة مقاومة للماء بحواف جلدية.",
  },
  {
    id: "f3", name: "نظارة شمسية بإطار مودرن", category: "fashion",
    price: 25, oldPrice: 32, rating: 4.5, reviews: 64, seller: "فاشن هب",
    img: "https://images.pexels.com/photos/27353350/pexels-photo-27353350.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 20,
    desc: "عدسات UV400 مستقطبة مع علبة جلدية ومنديل تنظيف.",
  },

  /* ---- عناية رجالية ---- */
  {
    id: "g1", name: "طقم عناية باللحية — 6 قطع", category: "grooming",
    price: 27, rating: 4.8, reviews: 145, seller: "جنتلمان كير",
    img: "https://images.pexels.com/photos/14649387/pexels-photo-14649387.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    badge: "الأعلى تقييمًا", stock: 16,
    desc: "زيت لحية، بلسم، شامبو، مشط خشبي، مقص وفرشاة — كل ما تحتاجه لحيتك.",
  },
  {
    id: "g2", name: "طقم حلاقة كلاسيك بفرشاة خشبية", category: "grooming",
    price: 16, rating: 4.6, reviews: 73, seller: "جنتلمان كير",
    img: "https://images.pexels.com/photos/8789612/pexels-photo-8789612.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: 14,
    desc: "فرشاة بمقبض خشبي وشعيرات ناعمة مع كريم حلاقة ووعاء تقديم.",
  },
];

/* ------------------------- البائعون ------------------------- */

export interface Seller {
  id: string;
  store: string;
  field: string;
  /** اسم الدخول المحدد للبائع */
  username: string;
  password: string;
  phone: string;
  rating: number;
  commission: number;
  joined: string;
  active: boolean;
}

export const SELLERS_SEED: Seller[] = [
  { id: "s1", store: "عطور ألفا", field: "عطور رجالية أصلية", username: "alpha", password: "alpha123", phone: "0791112233", rating: 4.9, commission: 8, joined: "2024/03", active: true },
  { id: "s2", store: "تك زون الأردن", field: "إلكترونيات وإكسسوارات", username: "techzone", password: "tech123", phone: "0792223344", rating: 4.7, commission: 10, joined: "2024/06", active: true },
  { id: "s3", store: "فاشن هب", field: "أزياء وأحذية", username: "fashionhub", password: "fashion123", phone: "0793334455", rating: 4.6, commission: 12, joined: "2024/09", active: true },
  { id: "s4", store: "جنتلمان كير", field: "عناية رجالية", username: "gentleman", password: "gent123", phone: "0794445566", rating: 4.8, commission: 10, joined: "2025/01", active: true },
];

/** صور افتراضية يختار منها البائع عند إضافة منتج جديد */
export const STOCK_IMAGES = [
  "https://images.pexels.com/photos/11216321/pexels-photo-11216321.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/7850600/pexels-photo-7850600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/33936400/pexels-photo-33936400.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/39076652/pexels-photo-39076652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/11292946/pexels-photo-11292946.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/13870707/pexels-photo-13870707.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/14649387/pexels-photo-14649387.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/4072683/pexels-photo-4072683.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
];

/* ------------------------- أكواد الخصم ------------------------- */

export interface DiscountCode {
  code: string;
  percent: number;
  active: boolean;
}

export const CODES_SEED: DiscountCode[] = [
  { code: "NOVA10", percent: 10, active: true },
  { code: "WELCOME15", percent: 15, active: true },
  { code: "LAUNCH50", percent: 50, active: false },
];

/* ------------------------- المدن والتوصيل ------------------------- */

export const CITIES: { name: string; fee: number }[] = [
  { name: "عمّان", fee: 2 },
  { name: "إربد", fee: 2.5 },
  { name: "الزرقاء", fee: 2.5 },
  { name: "البلقاء", fee: 3 },
  { name: "جرش", fee: 3 },
  { name: "عجلون", fee: 3 },
  { name: "المفرق", fee: 3 },
  { name: "الكرك", fee: 3 },
  { name: "مادبا", fee: 3 },
  { name: "معان", fee: 4 },
  { name: "العقبة", fee: 4 },
];

export const UNIVERSITIES = [
  "جامعة العلوم والتكنولوجيا الأردنية (JUST)",
  "جامعة اليرموك (YU)",
  "جامعة أردنية أخرى",
];

/* ------------------------- الطلبات والدفعات ------------------------- */

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface Payment {
  id: string;
  orderId: string;
  invoiceNo: string;
  senderPhone: string;
  customerName: string;
  amount: number;
  wallet: string;
  status: PaymentStatus;
  createdAt: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
}

export type OrderStatus = "بانتظار الدفع" | "قيد التجهيز" | "قيد التوصيل" | "مكتمل" | "ملغي";

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  code?: string;
  deliveryFee: number;
  total: number;
  customer: { name: string; phone: string; city: string; address: string; university?: string; notes?: string };
  paymentMethod: "cliq" | "cod";
  status: OrderStatus;
  createdAt: number;
}

export const PAYMENTS_SEED: Payment[] = [
  {
    id: "pay-1", orderId: "NV-DEMO-401", invoiceNo: "INV-88421", senderPhone: "0791234567",
    customerName: "أحمد الخطيب", amount: 89, wallet: "محفظة أورانج", status: "pending",
    createdAt: Date.now() - 1000 * 60 * 42,
  },
  {
    id: "pay-2", orderId: "NV-DEMO-402", invoiceNo: "INV-88397", senderPhone: "0787654321",
    customerName: "ليان العمري", amount: 41.5, wallet: "بنك الاتحاد", status: "pending",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: "pay-3", orderId: "NV-DEMO-399", invoiceNo: "INV-88054", senderPhone: "0771122334",
    customerName: "قصي الرواشدة", amount: 132, wallet: "محفظة أورانج", status: "approved",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
];

export const ORDERS_SEED: Order[] = [
  {
    id: "NV-DEMO-401",
    items: [{ id: "e2", name: "ساعة ذكية Ultra بشاشة أموليد", price: 89, qty: 1, img: PRODUCTS.find(p => p.id === "e2")!.img }],
    subtotal: 89, discount: 0, deliveryFee: 0, total: 89,
    customer: { name: "أحمد الخطيب", phone: "0791234567", city: "إربد", address: "حي الجامعة", university: "جامعة العلوم والتكنولوجيا الأردنية (JUST)", notes: "طالب — التوصيل للبوابة الرئيسية" },
    paymentMethod: "cliq", status: "بانتظار الدفع", createdAt: Date.now() - 1000 * 60 * 42,
  },
  {
    id: "NV-DEMO-398",
    items: [{ id: "p1", name: "ديور سوفاج — أو دو برفان", price: 89, qty: 1, img: PRODUCTS.find(p => p.id === "p1")!.img }],
    subtotal: 89, discount: 8.9, code: "NOVA10", deliveryFee: 2, total: 82.1,
    customer: { name: "سارة الحوراني", phone: "0779988776", city: "عمّان", address: "الصويفية — شارع فاطمة الزهراء" },
    paymentMethod: "cod", status: "قيد التوصيل", createdAt: Date.now() - 1000 * 60 * 60 * 30,
  },
  {
    id: "NV-DEMO-397",
    items: [{ id: "f1", name: "سنيكرز كلاسيك أبيض بكعب أزرق", price: 45, qty: 1, img: PRODUCTS.find(p => p.id === "f1")!.img }],
    subtotal: 45, discount: 6.75, code: "WELCOME15", deliveryFee: 2, total: 40.25,
    customer: { name: "يوسف البشيتي", phone: "0785566778", city: "عمّان", address: "خلدا — الدوار السابع" },
    paymentMethod: "cod", status: "مكتمل", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
  },
];

export const ORDER_STATUSES: OrderStatus[] = ["بانتظار الدفع", "قيد التجهيز", "قيد التوصيل", "مكتمل", "ملغي"];

export const timeAgo = (ts: number) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  return `قبل ${Math.floor(h / 24)} يوم`;
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
