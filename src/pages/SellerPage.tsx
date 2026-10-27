import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePercent,
  Boxes,
  LogOut,
  Package,
  Pencil,
  Plus,
  Star,
  Store,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { CATEGORIES, jod, STOCK_IMAGES } from "../lib/data";
import type { CategoryId, Product } from "../lib/data";
import { useShop } from "../lib/store";
import JordanClock from "../components/JordanClock";

const empty = {
  name: "",
  category: "perfumes" as CategoryId,
  price: "",
  oldPrice: "",
  stock: "10",
  desc: "",
  img: STOCK_IMAGES[0],
  badge: "",
};

export default function SellerPage() {
  const {
    currentSeller, sellerLogout,
    products, addProduct, updateProduct, deleteProduct,
    orders, notify,
  } = useShop();

  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);

  const myProducts = useMemo(
    () => products.filter((p) => p.seller === currentSeller?.store),
    [products, currentSeller]
  );

  /* إحصاءات المتجر من الطلبات الفعلية */
  const stats = useMemo(() => {
    const ids = new Set(myProducts.map((p) => p.id));
    let sales = 0;
    let units = 0;
    let ordersCount = 0;
    for (const o of orders) {
      const mine = o.items.filter((i) => ids.has(i.id));
      if (mine.length === 0) continue;
      ordersCount += 1;
      for (const i of mine) {
        sales += i.price * i.qty;
        units += i.qty;
      }
    }
    const commission = (sales * (currentSeller?.commission ?? 0)) / 100;
    return { sales, units, ordersCount, commission, net: sales - commission };
  }, [orders, myProducts, currentSeller]);

  if (!currentSeller) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <div className="card-nova flex w-full flex-col items-center px-8 py-14">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <Store className="size-7 text-nova-dust" />
          </span>
          <h1 className="mt-5 font-cairo text-2xl font-extrabold">بوابة البائعين</h1>
          <p className="mt-2 text-sm leading-7 text-white/50">
            هذه المنطقة مخصصة لمتاجر NOVA المعتمدة. سجّل الدخول باسم متجرك لإدارة منتجاتك وأسعارك.
          </p>
          <Link to="/login" className="btn-star mt-6 h-11 text-sm">تسجيل دخول البائع</Link>
        </div>
      </div>
    );
  }

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      stock: String(p.stock),
      desc: p.desc,
      img: p.img,
      badge: p.badge ?? "",
    });
    setShowForm(true);
  };

  const save = () => {
    const price = parseFloat(form.price);
    const oldPrice = form.oldPrice ? parseFloat(form.oldPrice) : undefined;
    const stock = parseInt(form.stock);
    if (form.name.trim().length < 3) return notify("اسم المنتج قصير جدًا");
    if (!price || price <= 0) return notify("أدخل سعرًا صحيحًا بالدينار");
    if (oldPrice !== undefined && oldPrice <= price) return notify("السعر قبل الخصم يجب أن يكون أعلى من السعر الحالي");
    if (isNaN(stock) || stock < 0) return notify("أدخل كمية مخزون صحيحة");

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(price.toFixed(2)),
      oldPrice: oldPrice ? Number(oldPrice.toFixed(2)) : undefined,
      stock,
      desc: form.desc.trim() || "منتج من متجر " + currentSeller.store,
      img: form.img,
      badge: form.badge.trim() || undefined,
    };

    if (editing) {
      updateProduct(editing.id, payload);
    } else {
      addProduct({
        id: `sp-${Date.now().toString(36)}`,
        seller: currentSeller.store,
        rating: 0,
        reviews: 0,
        ...payload,
      });
    }
    setShowForm(false);
  };

  const cards = [
    { icon: Boxes, label: "منتجاتي", value: String(myProducts.length), tint: "text-white" },
    { icon: Package, label: "طلبات تخص متجري", value: String(stats.ordersCount), tint: "text-nova-dust" },
    { icon: TrendingUp, label: "إجمالي المبيعات", value: jod(stats.sales), tint: "text-wa" },
    { icon: Wallet, label: `صافي الربح (بعد ${currentSeller.commission}%)`, value: jod(stats.net), tint: "text-nova-dust" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      {/* الرأس */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 font-nova text-2xl font-semibold text-nova-dust">
            {currentSeller.store[0]}
          </span>
          <div>
            <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">لوحة البائع</span>
            <h1 className="mt-0.5 font-cairo text-2xl font-extrabold sm:text-3xl">{currentSeller.store}</h1>
            <p className="mt-0.5 flex items-center gap-3 text-xs text-white/45">
              <span>{currentSeller.field}</span>
              <span className="flex items-center gap-1">
                <Star className="size-3 fill-nova-dust text-nova-dust" />
                {currentSeller.rating}
              </span>
              <span dir="ltr">@{currentSeller.username}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <JordanClock />
          <button onClick={sellerLogout} className="btn-ghost h-10 px-5 text-xs">
            <LogOut className="size-4" />
            خروج من المتجر
          </button>
        </div>
      </div>

      {/* الإحصاءات */}
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-nova p-5">
              <Icon className={`size-5 ${c.tint}`} />
              <p className="mt-3 font-nova text-xl font-semibold tabular-nums sm:text-2xl">{c.value}</p>
              <p className="mt-1 text-[11px] leading-5 text-white/50">{c.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* عمولة المنصة */}
      <div className="card-nova mt-4 flex flex-wrap items-center justify-between gap-3 p-5">
        <span className="flex items-center gap-2 text-sm text-white/65">
          <BadgePercent className="size-4 text-nova-dust" />
          عمولة منصة NOVA على متجرك: <span className="font-nova font-semibold text-white" dir="ltr">{currentSeller.commission}%</span>
        </span>
        <span className="text-xs text-white/45">
          خُصم من مبيعاتك: <span className="font-nova text-white/75">{jod(stats.commission)}</span> • القطع المباعة: {stats.units}
        </span>
      </div>

      {/* إدارة المنتجات */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-cairo text-xl font-extrabold">منتجاتي وأسعاري</h2>
          <p className="mt-1 text-xs text-white/45">أضف منتجات جديدة أو عدّل الأسعار والمخزون — التغييرات تظهر فورًا في المتجر.</p>
        </div>
        <button onClick={openNew} className="btn-star h-11 px-6 text-sm">
          <Plus className="size-4" />
          إضافة منتج
        </button>
      </div>

      {myProducts.length === 0 ? (
        <div className="card-nova mt-5 py-16 text-center text-white/45">
          لا توجد منتجات بعد — اضغط «إضافة منتج» لتبدأ البيع
        </div>
      ) : (
        <div className="card-nova mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="th-nova">المنتج</th>
                <th className="th-nova">التصنيف</th>
                <th className="th-nova">السعر</th>
                <th className="th-nova">قبل الخصم</th>
                <th className="th-nova">المخزون</th>
                <th className="th-nova">التقييم</th>
                <th className="th-nova">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => (
                <tr key={p.id} className="border-b border-white/5 transition-colors hover:bg-white/3">
                  <td className="td-nova">
                    <span className="flex items-center gap-3">
                      <img src={p.img} alt="" className="h-11 w-11 rounded-xl object-cover" />
                      <span className="max-w-56 truncate text-sm font-bold">{p.name}</span>
                    </span>
                  </td>
                  <td className="td-nova text-xs text-white/55">
                    {CATEGORIES.find((c) => c.id === p.category)?.name}
                  </td>
                  <td className="td-nova font-nova font-semibold text-nova-dust">{jod(p.price)}</td>
                  <td className="td-nova text-xs text-white/40">{p.oldPrice ? jod(p.oldPrice) : "—"}</td>
                  <td className="td-nova">
                    <span className={`font-nova font-semibold tabular-nums ${p.stock > 5 ? "text-white" : "text-amber-300"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="td-nova text-xs text-white/55">
                    {p.reviews > 0 ? `${p.rating} (${p.reviews})` : "جديد"}
                  </td>
                  <td className="td-nova">
                    <span className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="flex h-9 items-center gap-1 rounded-full border border-white/15 px-4 text-xs font-bold transition hover:border-white/50">
                        <Pencil className="size-3.5" />
                        تعديل
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        aria-label="حذف"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:border-red-400/50 hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نموذج المنتج */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="card-nova max-h-[92vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-cairo text-xl font-extrabold">
                  {editing ? "تعديل المنتج" : "إضافة منتج جديد"}
                </h3>
                <button onClick={() => setShowForm(false)} aria-label="إغلاق" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 hover:text-white">
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">اسم المنتج *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: عطر ألفا الذهبي 100 مل" className="input-nova" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">التصنيف *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CategoryId })} className="input-nova [&>option]:bg-nova-deep">
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">شارة (اختياري)</label>
                  <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="جديد / الأكثر مبيعًا" className="input-nova" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">السعر (د.أ) *</label>
                  <input type="number" min="0" step="0.5" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} dir="ltr" className="input-nova text-end font-nova" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">السعر قبل الخصم (اختياري)</label>
                  <input type="number" min="0" step="0.5" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} dir="ltr" className="input-nova text-end font-nova" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">المخزون *</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} dir="ltr" className="input-nova text-end font-nova" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-white/55">الوصف</label>
                  <textarea rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="تفاصيل المنتج، الحجم، المميزات..." className="input-nova h-auto resize-none py-3" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold text-white/55">صورة المنتج</label>
                  <div className="flex flex-wrap gap-2">
                    {STOCK_IMAGES.map((src) => (
                      <button
                        key={src}
                        onClick={() => setForm({ ...form, img: src })}
                        className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                          form.img === src ? "border-nova-dust" : "border-transparent opacity-55 hover:opacity-100"
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    value={form.img}
                    onChange={(e) => setForm({ ...form, img: e.target.value })}
                    placeholder="أو الصق رابط صورة مخصص"
                    dir="ltr"
                    className="input-nova mt-3 text-end text-xs"
                  />
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <button onClick={save} className="btn-star h-12 flex-1 text-sm">
                  {editing ? "حفظ التعديلات" : "نشر المنتج"}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-ghost h-12 px-7 text-sm">إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
