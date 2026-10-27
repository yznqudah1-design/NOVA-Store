import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  Copy,
  GraduationCap,
  MessageCircle,
  Receipt,
  Smartphone,
  Truck,
} from "lucide-react";
import {
  CITIES,
  CLIQ_ALIAS,
  EMAIL,
  FREE_DELIVERY_THRESHOLD,
  jod,
  UNIVERSITIES,
  WHATSAPP,
  WHATSAPP_INTL,
} from "../lib/data";
import type { Order, Payment } from "../lib/data";
import { useShop } from "../lib/store";

const PHONE_RE = /^07\d{8}$/;

export default function CheckoutPage() {
  const { cart, products, codes, placeOrder, addPayment, clearCart, customer, setCustomer, notify } = useShop();
  const location = useLocation() as { state?: { code?: string | null } };

  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [city, setCity] = useState(CITIES[0].name);
  const [address, setAddress] = useState("");
  const [university, setUniversity] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<"cliq" | "cod">("cliq");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const lines = cart
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.id)! }))
    .filter((l) => l.product);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.product.price * l.qty, 0), [lines]);
  const code = codes.find((c) => c.code === location.state?.code && c.active);
  const discount = code ? (subtotal * code.percent) / 100 : 0;

  const isStudent = university !== "" || /جامع/.test(notes);
  const cityFee = CITIES.find((c) => c.name === city)?.fee ?? 3;
  const deliveryFee = isStudent || subtotal - discount >= FREE_DELIVERY_THRESHOLD ? 0 : cityFee;
  const total = subtotal - discount + deliveryFee;

  const copyAlias = async () => {
    try {
      await navigator.clipboard.writeText(CLIQ_ALIAS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      notify(`اسم الدفع: ${CLIQ_ALIAS}`);
    }
  };

  const valid =
    lines.length > 0 &&
    name.trim().length >= 3 &&
    PHONE_RE.test(phone) &&
    address.trim().length >= 5 &&
    (method === "cod" || (invoiceNo.trim().length >= 4 && PHONE_RE.test(senderPhone)));

  const submit = () => {
    if (!valid) {
      notify("يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح");
      return;
    }
    const id = `NV-${Date.now().toString(36).toUpperCase()}`;
    const order: Order = {
      id,
      items: lines.map((l) => ({ id: l.product.id, name: l.product.name, price: l.product.price, qty: l.qty, img: l.product.img })),
      subtotal,
      discount,
      code: code?.code,
      deliveryFee,
      total,
      customer: {
        name: name.trim(),
        phone,
        city,
        address: address.trim(),
        university: university || undefined,
        notes: notes.trim() || undefined,
      },
      paymentMethod: method,
      status: method === "cliq" ? "بانتظار الدفع" : "قيد التجهيز",
      createdAt: Date.now(),
    };
    placeOrder(order);

    if (method === "cliq") {
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        orderId: id,
        invoiceNo: invoiceNo.trim(),
        senderPhone,
        customerName: name.trim(),
        amount: total,
        wallet: "كليك — أورانج موني / بنك الاتحاد",
        status: "pending",
        createdAt: Date.now(),
      };
      addPayment(payment);
    }

    setCustomer({ name: name.trim(), phone });
    clearCart();
    setPlacedOrder(order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- شاشة النجاح ---------------- */
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="card-nova relative overflow-hidden p-8 text-center sm:p-12"
        >
          <div className="pointer-events-none absolute -top-24 start-1/2 h-56 w-[30rem] -translate-x-1/2 rounded-full bg-wa/10 blur-[90px]" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 14 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-wa/15 text-wa"
          >
            <CheckCircle2 className="size-10" />
          </motion.span>
          <h1 className="mt-6 font-cairo text-3xl font-extrabold">تم استلام طلبك بنجاح</h1>
          <p className="mt-2 font-nova text-lg font-semibold tracking-wider text-nova-dust" dir="ltr">
            {placedOrder.id}
          </p>

          {placedOrder.paymentMethod === "cliq" ? (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-amber-300/30 bg-amber-300/8 p-5 text-start">
              <p className="flex items-center gap-2 text-sm font-bold text-amber-200">
                <Receipt className="size-4" />
                دفعتك بانتظار التدقيق
              </p>
              <p className="mt-2 text-[13px] leading-7 text-white/65">
                استلمنا رقم الفاتورة
                <span className="mx-1 font-nova font-semibold text-white" dir="ltr">#{invoiceNo}</span>
                وسيقوم فريقنا بتدقيقها مع المحفظة، ثم نتواصل معك على رقمك
                <span className="mx-1 font-semibold text-white" dir="ltr">{senderPhone}</span>
                لتأكيد الدفعة وانطلاق الطلب.
              </p>
            </div>
          ) : (
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/65">
              ستدفع عند الاستلام. سنتصل بك على <span className="font-semibold text-white" dir="ltr">{placedOrder.customer.phone}</span> لتأكيد الطلب قبل الشحن.
            </p>
          )}

          {placedOrder.deliveryFee === 0 && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-wa/10 px-4 py-1.5 text-xs font-bold text-wa">
              <Truck className="size-3.5" />
              حصلت على توصيل مجاني
              {placedOrder.customer.university ? " — مبادرة الطالب" : ""}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/products" className="btn-star h-11 text-sm">
              متابعة التسوّق
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(`استفسار عن طلبي ${placedOrder.id}`)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost h-11 text-sm"
            >
              <MessageCircle className="size-4" />
              تتبّع عبر واتساب
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="card-nova px-8 py-14">
          <p className="font-cairo text-xl font-bold text-white/70">لا يوجد ما يُشحن بعد — سلّتك فارغة</p>
          <Link to="/products" className="btn-star mt-6 h-11 text-sm">العودة للتسوّق</Link>
        </div>
      </div>
    );
  }

  /* ---------------- نموذج الطلب ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">الخطوة الأخيرة</span>
        <h1 className="mt-2 font-cairo text-3xl font-extrabold sm:text-4xl">إتمام الطلب</h1>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {/* معلومات التوصيل */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card-nova p-6 sm:p-7">
            <h2 className="flex items-center gap-2 font-cairo text-lg font-extrabold">
              <Truck className="size-5 text-nova-dust" />
              معلومات التوصيل
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/55">الاسم الكامل *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="محمد الأردني" className="input-nova" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/55">رقم الهاتف *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="07XXXXXXXX"
                  dir="ltr"
                  className="input-nova text-end font-nova tracking-wider"
                />
                {phone && !PHONE_RE.test(phone) && <p className="mt-1 text-[11px] text-red-400">أدخل رقمًا أردنيًا صحيحًا يبدأ بـ 07</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/55">المحافظة *</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="input-nova [&>option]:bg-nova-deep">
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name} — {jod(c.fee)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/55">العنوان التفصيلي *</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="الحي، الشارع، أقرب معلم" className="input-nova" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-white/55">هل أنت طالب جامعي؟ (اختياري)</label>
                <select value={university} onChange={(e) => setUniversity(e.target.value)} className="input-nova [&>option]:bg-nova-deep">
                  <option value="">لست طالبًا</option>
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-white/55">ملاحظات (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="وقت التوصيل المفضل، اسم الجامعة، رقم المبنى..."
                  className="input-nova h-auto resize-none py-3"
                />
              </div>
            </div>

            {/* تنبيه الطلاب */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-wa/25 bg-wa/8 p-4">
              <GraduationCap className="mt-0.5 size-5 shrink-0 text-wa" />
              <p className="text-[13px] leading-7 text-white/75">
                <span className="font-bold text-wa">طالب جامعي؟ التوصيل علينا!</span>{" "}
                التوصيل مجاني لجامعة العلوم والتكنولوجيا وجامعة اليرموك وباقي الجامعات
                الأردنية — فقط اختر جامعتك بالأعلى أو اكتب اسمها في الملاحظات.
              </p>
            </div>
          </motion.div>

          {/* الدفع */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card-nova p-6 sm:p-7">
            <h2 className="flex items-center gap-2 font-cairo text-lg font-extrabold">
              <Banknote className="size-5 text-nova-dust" />
              طريقة الدفع
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => setMethod("cliq")}
                className={`rounded-2xl border p-5 text-start transition-all duration-300 ${
                  method === "cliq" ? "border-nova-dust bg-nova-dust/8" : "border-white/10 hover:border-white/30"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-white font-nova text-[10px] font-bold tracking-tight text-black">CliQ</span>
                  {method === "cliq" && <BadgeCheck className="size-5 text-nova-dust" />}
                </span>
                <p className="mt-3 font-cairo text-sm font-extrabold">الدفع عبر كليك</p>
                <p className="mt-1 text-[11px] leading-5 text-white/50">محفظة أورانج موني أو بنك الاتحاد — تحويل فوري</p>
              </button>

              <button
                onClick={() => setMethod("cod")}
                className={`rounded-2xl border p-5 text-start transition-all duration-300 ${
                  method === "cod" ? "border-nova-dust bg-nova-dust/8" : "border-white/10 hover:border-white/30"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10"><Truck className="size-5" /></span>
                  {method === "cod" && <BadgeCheck className="size-5 text-nova-dust" />}
                </span>
                <p className="mt-3 font-cairo text-sm font-extrabold">الدفع عند الاستلام</p>
                <p className="mt-1 text-[11px] leading-5 text-white/50">نقدًا لمندوب NOVA عند وصول طلبك</p>
              </button>
            </div>

            {/* تعليمات كليك */}
            {method === "cliq" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <div className="mt-5 rounded-2xl border border-nova-dust/25 bg-nova-purple/40 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-white/55">حوّل المبلغ {jod(total)} على اسم الدفع (الكليك):</p>
                      <p className="mt-1 font-nova text-2xl font-semibold tracking-wider text-nova-dust" dir="ltr">{CLIQ_ALIAS}</p>
                    </div>
                    <button onClick={copyAlias} className="btn-ghost h-10 px-4 text-xs">
                      {copied ? <CheckCircle2 className="size-4 text-wa" /> : <Copy className="size-4" />}
                      {copied ? "تم النسخ" : "نسخ الاسم"}
                    </button>
                  </div>
                  <ol className="mt-4 space-y-2 border-t border-white/10 pt-4 text-[13px] leading-7 text-white/65">
                    <li><span className="font-nova font-semibold text-nova-dust">01 —</span> افتح محفظة <span className="font-bold text-white">أورانج موني</span> أو تطبيق <span className="font-bold text-white">بنك الاتحاد</span></li>
                    <li><span className="font-nova font-semibold text-nova-dust">02 —</span> اختر التحويل عبر «كليك» وأدخل الاسم <span className="font-nova font-semibold text-white" dir="ltr">{CLIQ_ALIAS}</span></li>
                    <li><span className="font-nova font-semibold text-nova-dust">03 —</span> حوّل قيمة الطلب، ثم املأ الحقلين أدناه — سنراجع الدفعة ونعتمدها يدويًا</li>
                  </ol>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/55">
                      <Receipt className="size-3.5" />
                      رقم الفاتورة / الحوالة *
                    </label>
                    <input
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      placeholder="مثال: INV-88421"
                      dir="ltr"
                      className="input-nova text-end font-nova tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/55">
                      <Smartphone className="size-3.5" />
                      رقم هاتف المُرسِل *
                    </label>
                    <input
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="07XXXXXXXX"
                      dir="ltr"
                      className="input-nova text-end font-nova tracking-wider"
                    />
                    <p className="mt-1.5 text-[11px] leading-5 text-white/40">
                      سيتم تدقيق الدفعة من لوحة الإدارة، وسنتواصل معك على هذا الرقم لتأكيدها قبل الشحن.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* الملخص */}
        <div className="lg:col-span-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-nova sticky top-28 p-6">
            <h2 className="font-cairo text-lg font-extrabold">طلبك ({lines.length})</h2>
            <div className="hide-scrollbar mt-4 max-h-56 space-y-3 overflow-y-auto pe-1">
              {lines.map((l) => (
                <div key={l.id} className="flex items-center gap-3">
                  <img src={l.product.img} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{l.product.name}</p>
                    <p className="text-[11px] text-white/45">× {l.qty}</p>
                  </div>
                  <span className="font-nova text-sm font-semibold text-white/80">{jod(l.product.price * l.qty)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-white/60"><span>المجموع الفرعي</span><span>{jod(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-wa"><span>خصم {code?.code}</span><span>-{jod(discount)}</span></div>}
              <div className="flex justify-between text-white/60">
                <span>التوصيل — {city}</span>
                <span className={deliveryFee === 0 ? "font-bold text-wa" : ""}>
                  {deliveryFee === 0 ? "مجاني" : jod(deliveryFee)}
                </span>
              </div>
              {isStudent && (
                <p className="flex items-center gap-1.5 text-[11px] text-wa">
                  <GraduationCap className="size-3.5" />
                  توصيل مجاني — مبادرة الطالب الجامعي
                </p>
              )}
              <div className="flex justify-between border-t border-white/10 pt-3 font-cairo text-lg font-extrabold">
                <span>الإجمالي</span>
                <span className="font-nova text-2xl text-nova-dust">{jod(total)}</span>
              </div>
            </div>

            <button onClick={submit} disabled={!valid} className="btn-star mt-6 h-13 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">
              تأكيد الطلب
              <ChevronLeft className="size-4" />
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-white/40">
              بالضغط على «تأكيد الطلب» سيتواصل معك فريق NOVA على هاتفك لتأكيد التفاصيل.
              للمساعدة: <span dir="ltr" className="text-white/60">{WHATSAPP}</span> أو {EMAIL}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
