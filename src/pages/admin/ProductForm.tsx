import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import type { AdminProduct, Availability, Category, Supplier } from "../../lib/data";
import { cleanError, jod } from "../../lib/data";
import { checkPrice, novaFloor, novaPrice } from "../../lib/pricing";
import type { Api } from "../../lib/api";

interface Props {
  api: Api;
  editing: AdminProduct | null;
  categories: Category[];
  suppliers: Supplier[];
  imageChoices: string[];
  onClose: () => void;
  onSaved: () => void;
}

const fromProduct = (p: AdminProduct | null, defaultCat: string) => ({
  name: p?.name ?? "",
  category: p?.category ?? defaultCat,
  supplierPrice: p?.cost ? String(p.cost.supplierPrice) : "",
  supplierId: p?.cost?.supplierId ?? "",
  supplierUrl: p?.cost?.supplierUrl ?? "",
  price: p ? String(p.price) : "",
  oldPrice: p?.oldPrice ? String(p.oldPrice) : "",
  availability: (p?.availability ?? "in_stock") as Availability,
  prepDays: String(p?.prepDays ?? 1),
  stock: String(p?.stock ?? 10),
  isOriginalGuaranteed: p?.isOriginalGuaranteed ?? false,
  active: p?.active ?? true,
  badge: p?.badge ?? "",
  desc: p?.desc ?? "",
  img: p?.img ?? "",
});

export default function ProductForm({ api, editing, categories, suppliers, imageChoices, onClose, onSaved }: Props) {
  const [f, setF] = useState(() => fromProduct(editing, categories[0]?.id ?? "perfumes"));
  /* السعر يُملأ تلقائيًا من سعر المورد حتى يعدّله المدير يدويًا */
  const [priceTouched, setPriceTouched] = useState(!!editing);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const supplier = parseFloat(f.supplierPrice);
  const hasSupplier = !isNaN(supplier) && supplier > 0;
  const suggested = hasSupplier ? novaPrice(supplier) : null;
  const price = parseFloat(f.price);
  const oldPrice = f.oldPrice ? parseFloat(f.oldPrice) : undefined;
  const check = checkPrice(price, hasSupplier ? supplier : null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  const onSupplierPrice = (v: string) => {
    const n = parseFloat(v);
    setF((s) => ({ ...s, supplierPrice: v, price: !priceTouched && n > 0 ? String(novaPrice(n)) : s.price }));
  };

  const onAvailability = (a: Availability) =>
    setF((s) => ({ ...s, availability: a, prepDays: s.prepDays === "1" || s.prepDays === "3" ? (a === "on_order" ? "3" : "1") : s.prepDays }));

  const save = async () => {
    const stock = parseInt(f.stock);
    const prepDays = parseInt(f.prepDays);
    if (f.name.trim().length < 3) return setErr("اسم المنتج قصير جدًا");
    if (!price || price <= 0) return setErr("أدخل سعر بيع صحيح بالدينار");
    if (oldPrice !== undefined && !(oldPrice > price)) return setErr("السعر قبل الخصم يجب أن يكون أعلى من سعر البيع");
    if (isNaN(stock) || stock < 0) return setErr("أدخل كمية مخزون صحيحة");
    if (isNaN(prepDays) || prepDays < 0 || prepDays > 60) return setErr("مدة التجهيز بين 0 و60 يومًا");
    if (!f.img.trim()) return setErr("اختر صورة للمنتج");
    if (check.level === "error") return setErr(check.msg);
    setErr("");
    setSaving(true);
    try {
      await api.admin.saveProduct(
        {
          id: editing?.id,
          name: f.name.trim(),
          category: f.category,
          price: Number(price.toFixed(2)),
          oldPrice: oldPrice ? Number(oldPrice.toFixed(2)) : undefined,
          img: f.img.trim(),
          badge: f.badge.trim() || undefined,
          desc: f.desc.trim(),
          stock,
          availability: f.availability,
          prepDays,
          isOriginalGuaranteed: f.isOriginalGuaranteed,
          active: f.active,
        },
        hasSupplier
          ? { supplierPrice: Number(supplier.toFixed(2)), supplierId: f.supplierId || undefined, supplierUrl: f.supplierUrl.trim() || undefined }
          : null
      );
      onSaved();
    } catch (e) {
      setErr(cleanError(e));
    } finally {
      setSaving(false);
    }
  };

  const label = "mb-1.5 block text-xs font-semibold text-white/55";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="card-nova max-h-[92vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-cairo text-xl font-extrabold">{editing ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
          <button onClick={onClose} aria-label="إغلاق" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>اسم المنتج *</label>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} className="input-nova" />
          </div>
          <div>
            <label className={label}>القسم *</label>
            <select value={f.category} onChange={(e) => set("category", e.target.value)} className="input-nova [&>option]:bg-nova-deep">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.storeName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>شارة (اختياري)</label>
            <input value={f.badge} onChange={(e) => set("badge", e.target.value)} placeholder="جديد / عرض خاص" className="input-nova" />
          </div>

          {/* ---- التسعير (سري) ---- */}
          <div className="rounded-2xl border border-nova-dust/25 bg-nova-purple/30 p-4 sm:col-span-2">
            <p className="text-[11px] font-bold text-nova-dust">التسعير — سعر المورد لا يظهر للزبون أبدًا</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={label}>سعر المورد (د.أ)</label>
                <input type="number" min="0" step="0.01" value={f.supplierPrice} onChange={(e) => onSupplierPrice(e.target.value)} dir="ltr" className="input-nova text-end font-nova" />
              </div>
              <div>
                <label className={label}>سعر البيع (د.أ) *</label>
                <input
                  type="number" min="0" step="0.5" value={f.price}
                  onChange={(e) => { setPriceTouched(true); set("price", e.target.value); }}
                  dir="ltr" className="input-nova text-end font-nova"
                />
              </div>
              <div>
                <label className={label}>السعر قبل الخصم</label>
                <input type="number" min="0" step="0.5" value={f.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} dir="ltr" className="input-nova text-end font-nova" />
              </div>
            </div>
            {hasSupplier && suggested !== null && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-white/60">
                <span>المقترح (×1.20): <b className="font-nova text-white">{jod(suggested)}</b></span>
                <span>الحد الأدنى بعد الخصم (×1.10): <b className="font-nova text-white">{jod(novaFloor(supplier))}</b></span>
                {price > 0 && <span>الربح: <b className="font-nova text-white">{jod(price - supplier)}</b> ({Math.round(((price - supplier) / supplier) * 100)}%)</span>}
                {String(suggested) !== f.price && (
                  <button onClick={() => { set("price", String(suggested)); setPriceTouched(false); }} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold hover:border-white/40">
                    <Sparkles className="size-3" /> استخدم المقترح
                  </button>
                )}
              </div>
            )}
            {check.level !== "ok" && (
              <p className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-[12px] leading-6 ${check.level === "error" ? "bg-red-400/10 text-red-300" : "bg-amber-300/10 text-amber-200"}`}>
                <AlertTriangle className="mt-1 size-3.5 shrink-0" />
                {check.msg}
              </p>
            )}
            {!hasSupplier && (
              <p className="mt-3 text-[11px] text-white/40">بدون سعر مورد لا يمكن حساب السعر المقترح ولا حماية الحد الأدنى عند الخصم.</p>
            )}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>المورد</label>
                <select value={f.supplierId} onChange={(e) => set("supplierId", e.target.value)} className="input-nova [&>option]:bg-nova-deep">
                  <option value="">— بدون —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>رابط المنتج عند المورد</label>
                <input value={f.supplierUrl} onChange={(e) => set("supplierUrl", e.target.value)} dir="ltr" placeholder="https://facebook.com/..." className="input-nova text-end text-xs" />
              </div>
            </div>
          </div>

          <div>
            <label className={label}>التوفر *</label>
            <select value={f.availability} onChange={(e) => onAvailability(e.target.value as Availability)} className="input-nova [&>option]:bg-nova-deep">
              <option value="in_stock">متوفر فوراً (مخزون)</option>
              <option value="on_order">عند الطلب (من مورد)</option>
            </select>
          </div>
          <div>
            <label className={label}>مدة التجهيز (أيام)</label>
            <input type="number" min="0" max="60" value={f.prepDays} onChange={(e) => set("prepDays", e.target.value)} dir="ltr" className="input-nova text-end font-nova" />
          </div>
          <div>
            <label className={label}>المخزون {f.availability === "on_order" && "(لا يُستخدم لعند الطلب)"}</label>
            <input type="number" min="0" value={f.stock} onChange={(e) => set("stock", e.target.value)} dir="ltr" className="input-nova text-end font-nova" />
          </div>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={f.isOriginalGuaranteed} onChange={(e) => set("isOriginalGuaranteed", e.target.checked)} className="size-4 accent-[#c9b896]" />
              أصلي مضمون (تظهر الشارة للزبون)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="size-4 accent-[#25d366]" />
              معروض في المتجر
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>الوصف</label>
            <textarea rows={3} value={f.desc} onChange={(e) => set("desc", e.target.value)} className="input-nova h-auto resize-none py-3" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-semibold text-white/55">صورة المنتج *</label>
            <div className="flex flex-wrap gap-2">
              {imageChoices.slice(0, 10).map((src) => (
                <button
                  key={src}
                  onClick={() => set("img", src)}
                  className={`h-14 w-14 overflow-hidden rounded-xl border-2 transition ${f.img === src ? "border-nova-dust" : "border-transparent opacity-55 hover:opacity-100"}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <input value={f.img} onChange={(e) => set("img", e.target.value)} placeholder="أو الصق رابط صورة" dir="ltr" className="input-nova mt-3 text-end text-xs" />
          </div>
        </div>

        {err && <p className="mt-4 rounded-xl bg-red-400/10 px-3 py-2 text-xs text-red-300">{err}</p>}
        <div className="mt-6 flex gap-3">
          <button onClick={save} disabled={saving} className="btn-star h-12 flex-1 text-sm disabled:opacity-50">
            {saving ? "جارِ الحفظ…" : editing ? "حفظ التعديلات" : "نشر المنتج"}
          </button>
          <button onClick={onClose} className="btn-ghost h-12 px-7 text-sm">إلغاء</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
