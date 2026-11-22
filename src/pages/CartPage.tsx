import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingCart, TicketPercent, Trash2 } from "lucide-react";
import { jod } from "../lib/data";
import { useShop } from "../lib/store";
import { AvailabilityBadge } from "../components/ProductBadges";

export default function CartPage() {
  const { api, cart, products, setQty, removeFromCart, notify, storeNameOf, cities, settings } = useShop();
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; percent: number } | null>(null);
  const [serverDiscount, setServerDiscount] = useState(0);

  const lines = cart
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.id)! }))
    .filter((l) => l.product);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.product.price * l.qty, 0), [lines]);

  /* الخصم يحسبه الخادم (قد يُقيَّد على بعض المنتجات لحماية الحد الأدنى للسعر) */
  const cartKey = JSON.stringify(cart);
  useEffect(() => {
    if (!api || !applied || cart.length === 0 || cities.length === 0) {
      setServerDiscount(0);
      return;
    }
    let alive = true;
    api
      .quote(cart, applied.code, cities[0].name, false)
      .then((q) => alive && setServerDiscount(q.discount))
      .catch(() => alive && setServerDiscount(0));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, applied, cartKey, cities]);
  const discount = applied ? serverDiscount : 0;

  const applyCode = async () => {
    if (!api || !codeInput.trim()) return;
    try {
      const percent = await api.checkCode(codeInput);
      if (percent === null) return notify("الكود غير موجود أو غير فعّال");
      setApplied({ code: codeInput.trim().toUpperCase(), percent });
      notify(`تم تطبيق خصم ${percent}%`);
    } catch {
      notify("تعذّر التحقق من الكود — حاول مجددًا");
    }
  };
  const appliedCode = applied;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-28 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-nova flex flex-col items-center px-10 py-16"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
            <ShoppingCart className="size-9 text-white/30" />
          </span>
          <h1 className="mt-6 font-cairo text-2xl font-extrabold">سلّتك فارغة كالفضاء العميق</h1>
          <p className="mt-2 max-w-xs text-sm text-white/50">أضف بعض النجوم إليها — تصفّح العطور والإلكترونيات والأزياء.</p>
          <Link to="/products" className="btn-star mt-7 h-11 text-sm">
            ابدأ التسوّق
            <ArrowLeft className="size-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">سلّة التسوق</span>
        <h1 className="mt-2 font-cairo text-3xl font-extrabold sm:text-4xl">طلبك جاهز للانطلاق</h1>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* العناصر */}
        <div className="space-y-3 lg:col-span-8">
          {lines.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-nova flex items-center gap-4 p-4"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                <img src={l.product.img} alt={l.product.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-white/40">{storeNameOf(l.product)}</span>
                <h3 className="truncate font-cairo text-sm font-bold sm:text-base">{l.product.name}</h3>
                <span className="mt-1 block font-nova text-lg font-semibold text-nova-dust">{jod(l.product.price)}</span>
                <span className="mt-1 block"><AvailabilityBadge p={l.product} compact /></span>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center rounded-full border border-white/12">
                  <button onClick={() => setQty(l.id, l.qty - 1)} className="flex h-9 w-9 items-center justify-center text-white/60 hover:text-white" aria-label="إنقاص">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center font-nova font-semibold tabular-nums">{l.qty}</span>
                  <button onClick={() => setQty(l.id, l.qty + 1)} className="flex h-9 w-9 items-center justify-center text-white/60 hover:text-white" aria-label="زيادة">
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(l.id)}
                  className="flex items-center gap-1 text-[11px] text-white/40 transition hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                  إزالة
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* الملخص */}
        <div className="lg:col-span-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-nova sticky top-28 p-6">
            <h2 className="font-cairo text-lg font-extrabold">ملخص الطلب</h2>

            {/* كود الخصم */}
            <div className="mt-5">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
                <TicketPercent className="size-4 text-nova-dust" />
                كود الخصم
              </label>
              <div className="flex gap-2" dir="ltr">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="NOVA10"
                  className="input-nova h-11 flex-1 font-nova tracking-widest"
                />
                <button onClick={applyCode} className="btn-ghost h-11 px-5 text-xs">
                  تطبيق
                </button>
              </div>
              {appliedCode && (
                <p className="mt-2 flex items-center justify-between text-xs text-wa">
                  <span>مفعّل: {appliedCode.code} — خصم {appliedCode.percent}%</span>
                  <button onClick={() => setApplied(null)} className="text-white/40 hover:text-red-400">إلغاء</button>
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
              <div className="flex justify-between text-white/65">
                <span>المجموع الفرعي</span>
                <span>{jod(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-wa">
                  <span>الخصم</span>
                  <span>-{jod(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/65">
                <span>التوصيل</span>
                <span className="text-xs">يُحسب عند إتمام الطلب</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-4 font-cairo text-lg font-extrabold">
                <span>الإجمالي التقريبي</span>
                <span className="font-nova text-nova-dust">{jod(subtotal - discount)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              state={{ code: applied?.code ?? null }}
              className="btn-star mt-6 h-13 w-full py-3.5"
            >
              إتمام الطلب
              <ArrowLeft className="size-4" />
            </Link>
            <p className="mt-3 text-center text-[11px] text-white/40">
              توصيل مجاني للطلبات فوق {jod(settings.freeDeliveryThreshold)} ولطلاب الجامعات الأردنية
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
