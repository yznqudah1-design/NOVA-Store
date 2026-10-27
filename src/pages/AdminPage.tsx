import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Banknote,
  BarChart3,
  Check,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Package,
  RotateCcw,
  Star,
  Store,
  TicketPercent,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import {
  jod,
  jordanMonthKey,
  jordanMonthLabel,
  nextMonthKey,
  ORDER_STATUSES,
  prevMonthKey,
  timeAgo,
} from "../lib/data";
import type { OrderStatus } from "../lib/data";
import { useShop } from "../lib/store";
import JordanClock from "../components/JordanClock";

type Tab = "overview" | "payments" | "orders" | "sellers" | "codes" | "reports";

const TABS: { id: Tab; label: string; icon: typeof Banknote }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "payments", label: "الدفعات", icon: Banknote },
  { id: "orders", label: "الطلبات", icon: ClipboardList },
  { id: "sellers", label: "البائعون", icon: Store },
  { id: "codes", label: "أكواد الخصم", icon: TicketPercent },
  { id: "reports", label: "تقارير الأكواد", icon: BarChart3 },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  approved: "border-wa/40 bg-wa/10 text-wa",
  rejected: "border-red-400/40 bg-red-400/10 text-red-300",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "بانتظار التدقيق",
  approved: "معتمدة",
  rejected: "مرفوضة",
};

const emptySeller = {
  store: "",
  field: "",
  phone: "",
  username: "",
  password: "",
  commission: "10",
};

export default function AdminPage() {
  const {
    adminAuthed, adminLogin,
    payments, setPaymentStatus,
    orders, setOrderStatus,
    sellers, toggleSeller, addSeller, removeSeller,
    codes, addCode, removeCode, toggleCode,
    products,
  } = useShop();
  const [tab, setTab] = useState<Tab>("payments");
  const [newCode, setNewCode] = useState("");
  const [newPercent, setNewPercent] = useState("10");
  const [ns, setNs] = useState(emptySeller);
  const [sellerErr, setSellerErr] = useState("");

  /* ------- حارس الدخول ------- */
  if (!adminAuthed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <div className="card-nova flex w-full flex-col items-center px-8 py-14">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <Lock className="size-7 text-nova-dust" />
          </span>
          <h1 className="mt-5 font-cairo text-2xl font-extrabold">منطقة الإدارة</h1>
          <p className="mt-2 text-sm text-white/50">هذه الصفحة مخصصة لإدارة الموقع فقط — سجّل الدخول بحساب الإدارة للمتابعة.</p>
          <Link to="/login" className="btn-star mt-6 h-11 text-sm">تسجيل دخول الإدارة</Link>
        </div>
      </div>
    );
  }

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const approvedTotal = payments.filter((p) => p.status === "approved").reduce((s, p) => s + p.amount, 0);

  /* ------- تقارير استخدام الأكواد — مجمّعة شهريًا بتوقيت عمّان ------- */
  const currentKey = jordanMonthKey(Date.now());

  const usageByMonth = useMemo(() => {
    const map = new Map<
      string,
      { code: string; monthKey: string; count: number; sales: number; discount: number; last: number }
    >();
    for (const o of orders) {
      if (!o.code) continue;
      const monthKey = jordanMonthKey(o.createdAt);
      const id = `${monthKey}:${o.code}`;
      const cur =
        map.get(id) ?? { code: o.code, monthKey, count: 0, sales: 0, discount: 0, last: 0 };
      cur.count += 1;
      cur.sales += o.total;
      cur.discount += o.discount;
      cur.last = Math.max(cur.last, o.createdAt);
      map.set(id, cur);
    }
    return [...map.values()];
  }, [orders]);

  /** صفوف الشهر الحالي — كل الأكواد حتى لو استخدامها صفر */
  const reportRows = useMemo(() => {
    const rows = codes.map((c) => {
      const u = usageByMonth.find((x) => x.monthKey === currentKey && x.code === c.code);
      return {
        code: c.code,
        percent: c.percent,
        active: c.active,
        deleted: false,
        count: u?.count ?? 0,
        sales: u?.sales ?? 0,
        discount: u?.discount ?? 0,
        last: u?.last ?? 0,
      };
    });
    /* أكواد حُذفت لكنها استُخدمت هذا الشهر */
    for (const u of usageByMonth) {
      if (u.monthKey === currentKey && !rows.some((r) => r.code === u.code)) {
        rows.push({
          code: u.code, percent: 0, active: false, deleted: true,
          count: u.count, sales: u.sales, discount: u.discount, last: u.last,
        });
      }
    }
    return rows.sort((a, b) => b.sales - a.sales);
  }, [codes, usageByMonth, currentKey]);

  const monthTotals = useMemo(
    () => ({
      count: reportRows.reduce((s, r) => s + r.count, 0),
      sales: reportRows.reduce((s, r) => s + r.sales, 0),
      discount: reportRows.reduce((s, r) => s + r.discount, 0),
    }),
    [reportRows]
  );

  const prevKey = prevMonthKey(currentKey);
  const prevEntries = usageByMonth.filter((u) => u.monthKey === prevKey);
  const prevTotals = {
    count: prevEntries.reduce((s, u) => s + u.count, 0),
    sales: prevEntries.reduce((s, u) => s + u.sales, 0),
    discount: prevEntries.reduce((s, u) => s + u.discount, 0),
  };
  const prevBest = prevEntries.sort((a, b) => b.sales - a.sales)[0];

  const stats = [
    { label: "دفعات بانتظار التدقيق", value: String(pendingCount), icon: Banknote, tint: "text-amber-200" },
    { label: "إجمالي الطلبات", value: String(orders.length), icon: Package, tint: "text-white" },
    { label: "مبيعات معتمدة", value: jod(approvedTotal), icon: Check, tint: "text-wa" },
    { label: "أكواد فعّالة", value: String(codes.filter((c) => c.active).length), icon: TicketPercent, tint: "text-nova-dust" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      {/* الرأس */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">لوحة التحكم — إدارة الموقع فقط</span>
          <h1 className="mt-1 font-cairo text-3xl font-extrabold">مرحبًا أيها المدير</h1>
          <div className="mt-3">
            <JordanClock />
          </div>
        </div>
        <button
          onClick={() => adminLogin(false)}
          className="btn-ghost h-10 px-5 text-xs"
        >
          <LogOut className="size-4" />
          تسجيل الخروج
        </button>
      </div>

      {/* التبويبات */}
      <div className="hide-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`chip ${tab === t.id ? "chip-active" : ""}`}>
              <Icon className="size-3.5" />
              {t.label}
              {t.id === "payments" && pendingCount > 0 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-300 text-[9px] font-bold text-black">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------------- نظرة عامة ---------------- */}
      {tab === "overview" && (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-nova p-6">
                <Icon className={`size-5 ${s.tint}`} />
                <p className="mt-4 font-nova text-2xl font-semibold sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-white/50">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ---------------- الدفعات ---------------- */}
      {tab === "payments" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <p className="mb-4 text-sm leading-7 text-white/50">
            كل دفعات كليك الواردة تظهر هنا — طابق رقم الفاتورة مع كشف المحفظة ثم اعتمدها أو ارفضها.
            رقم هاتف الزبون ظاهر بجانب الفاتورة للتواصل والتأكيد.
          </p>
          {payments.length === 0 ? (
            <div className="card-nova py-16 text-center text-white/45">لا توجد دفعات بعد</div>
          ) : (
            <div className="card-nova overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="th-nova">الطلب</th>
                    <th className="th-nova">رقم الفاتورة</th>
                    <th className="th-nova">هاتف الزبون</th>
                    <th className="th-nova">الاسم</th>
                    <th className="th-nova">المبلغ</th>
                    <th className="th-nova">الوقت</th>
                    <th className="th-nova">الحالة</th>
                    <th className="th-nova">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 transition-colors hover:bg-white/3">
                      <td className="td-nova font-nova text-xs text-white/60" dir="ltr">{p.orderId}</td>
                      <td className="td-nova">
                        <span className="rounded-lg bg-white/8 px-2.5 py-1 font-nova text-xs font-semibold tracking-wider" dir="ltr">
                          {p.invoiceNo}
                        </span>
                      </td>
                      <td className="td-nova">
                        <a href={`tel:${p.senderPhone}`} className="font-nova font-semibold text-wa hover:underline" dir="ltr">
                          {p.senderPhone}
                        </a>
                      </td>
                      <td className="td-nova text-white/75">{p.customerName}</td>
                      <td className="td-nova font-nova font-semibold">{jod(p.amount)}</td>
                      <td className="td-nova text-xs text-white/45">{timeAgo(p.createdAt)}</td>
                      <td className="td-nova">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_STYLE[p.status]}`}>
                          {STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td className="td-nova">
                        {p.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPaymentStatus(p.id, "approved")}
                              className="flex h-9 items-center gap-1 rounded-full bg-wa px-4 text-xs font-bold text-black transition hover:brightness-110"
                            >
                              <Check className="size-3.5" />
                              اعتماد
                            </button>
                            <button
                              onClick={() => setPaymentStatus(p.id, "rejected")}
                              className="flex h-9 items-center gap-1 rounded-full border border-red-400/40 px-4 text-xs font-bold text-red-300 transition hover:bg-red-400/10"
                            >
                              <X className="size-3.5" />
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ---------------- الطلبات ---------------- */}
      {tab === "orders" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-3">
          {orders.length === 0 && <div className="card-nova py-16 text-center text-white/45">لا توجد طلبات بعد</div>}
          {orders.map((o) => (
            <div key={o.id} className="card-nova p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-nova text-sm font-semibold text-nova-dust" dir="ltr">{o.id}</span>
                  <span className="text-xs text-white/40">{timeAgo(o.createdAt)}</span>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                  className="h-9 rounded-full border border-white/15 bg-nova-purple/50 px-4 text-xs font-bold outline-none [&>option]:bg-nova-deep"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.items.map((it) => (
                  <span key={it.id} className="flex items-center gap-2 rounded-full bg-white/5 py-1.5 ps-1.5 pe-3 text-xs">
                    <img src={it.img} alt="" className="h-6 w-6 rounded-full object-cover" />
                    {it.name} × {it.qty}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-white/50">
                <span>الزبون: <span className="text-white/80">{o.customer.name}</span></span>
                <span>هاتف: <span dir="ltr" className="font-nova text-white/80">{o.customer.phone}</span></span>
                <span>{o.customer.city}</span>
                <span>الدفع: {o.paymentMethod === "cliq" ? "كليك" : "عند الاستلام"}</span>
                {o.code && <span>كود: <span dir="ltr" className="font-nova text-nova-dust">{o.code}</span></span>}
                <span className="ms-auto font-nova text-base font-semibold text-white">{jod(o.total)}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ---------------- البائعون ---------------- */}
      {tab === "sellers" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        {/* نموذج إضافة بائع */}
        <div className="card-nova p-6">
          <h2 className="flex items-center gap-2 font-cairo text-lg font-extrabold">
            <UserPlus className="size-5 text-nova-dust" />
            إضافة بائع جديد
          </h2>
          <p className="mt-1 text-xs text-white/45">
            أنشئ متجرًا جديدًا وامنحه اسم دخول وكلمة مرور — سيتمكن البائع من إدارة منتجاته وأسعاره من بوابة البائعين.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/55">اسم المتجر *</label>
              <input value={ns.store} onChange={(e) => setNs({ ...ns, store: e.target.value })} placeholder="متجر النجوم" className="input-nova" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/55">مجال المتجر</label>
              <input value={ns.field} onChange={(e) => setNs({ ...ns, field: e.target.value })} placeholder="إلكترونيات وإكسسوارات" className="input-nova" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/55">رقم الهاتف</label>
              <input value={ns.phone} onChange={(e) => setNs({ ...ns, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="07XXXXXXXX" dir="ltr" className="input-nova text-end font-nova" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/55">اسم الدخول *</label>
              <input value={ns.username} onChange={(e) => setNs({ ...ns, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} placeholder="newstore" dir="ltr" className="input-nova text-end font-nova tracking-wider" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/55">كلمة المرور *</label>
              <input value={ns.password} onChange={(e) => setNs({ ...ns, password: e.target.value })} placeholder="6 أحرف فأكثر" dir="ltr" className="input-nova text-end" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/55">العمولة %</label>
              <input type="number" min={0} max={40} value={ns.commission} onChange={(e) => setNs({ ...ns, commission: e.target.value })} dir="ltr" className="input-nova text-end font-nova" />
            </div>
          </div>
          {sellerErr && <p className="mt-3 text-xs text-red-400">{sellerErr}</p>}
          <button
            onClick={() => {
              if (ns.store.trim().length < 3) return setSellerErr("اسم المتجر قصير جدًا");
              if (ns.username.trim().length < 3) return setSellerErr("اسم الدخول يجب أن يكون 3 أحرف فأكثر");
              if (ns.password.length < 6) return setSellerErr("كلمة المرور يجب أن تكون 6 أحرف فأكثر");
              const err = addSeller({
                id: `s-${Date.now().toString(36)}`,
                store: ns.store.trim(),
                field: ns.field.trim() || "منتجات متنوعة",
                username: ns.username.trim(),
                password: ns.password,
                phone: ns.phone || "—",
                rating: 0,
                commission: Math.max(0, Math.min(40, parseInt(ns.commission) || 10)),
                joined: jordanMonthKey(Date.now()).replace("-", "/"),
                active: true,
              });
              if (err) return setSellerErr(err);
              setSellerErr("");
              setNs(emptySeller);
            }}
            className="btn-star mt-5 h-11 px-7 text-sm"
          >
            <UserPlus className="size-4" />
            إنشاء حساب البائع
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sellers.map((s) => (
            <div key={s.id} className={`card-nova p-6 transition-opacity ${!s.active ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 font-nova text-lg font-semibold text-nova-dust">
                    {s.store[0]}
                  </span>
                  <div>
                    <h3 className="font-cairo font-extrabold">{s.store}</h3>
                    <p className="text-xs text-white/45">{s.field}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSeller(s.id)}
                  className={`relative h-6.5 w-11 rounded-full transition-colors duration-300 ${s.active ? "bg-wa" : "bg-white/15"}`}
                  aria-label="تفعيل/إيقاف البائع"
                >
                  <span className={`absolute top-0.75 h-5 w-5 rounded-full bg-white transition-all duration-300 ${s.active ? "start-[22px]" : "start-1"}`} />
                </button>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 border-t border-white/10 pt-4 text-center">
                <div>
                  <p className="flex items-center justify-center gap-1 font-nova text-lg font-semibold">
                    <Star className="size-3.5 fill-nova-dust text-nova-dust" />
                    {s.rating || "—"}
                  </p>
                  <p className="text-[10px] text-white/40">التقييم</p>
                </div>
                <div>
                  <p className="font-nova text-lg font-semibold">{products.filter((p) => p.seller === s.store).length}</p>
                  <p className="text-[10px] text-white/40">منتج</p>
                </div>
                <div>
                  <p className="font-nova text-lg font-semibold" dir="ltr">{s.commission}%</p>
                  <p className="text-[10px] text-white/40">العمولة</p>
                </div>
                <div>
                  <p className="font-nova text-lg font-semibold" dir="ltr">{s.joined}</p>
                  <p className="text-[10px] text-white/40">انضم</p>
                </div>
              </div>

              {/* بيانات الدخول */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/4 px-4 py-3">
                <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/55">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-nova-dust" />
                    اسم الدخول: <span className="font-nova font-semibold text-white" dir="ltr">{s.username}</span>
                  </span>
                  <span>كلمة المرور: <span className="font-nova text-white/80" dir="ltr">{s.password}</span></span>
                  <span dir="ltr" className="text-white/50">{s.phone}</span>
                </span>
                <button
                  onClick={() => removeSeller(s.id)}
                  aria-label="حذف البائع"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:border-red-400/50 hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        </motion.div>
      )}

      {/* ---------------- أكواد الخصم ---------------- */}
      {tab === "codes" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <div className="card-nova flex flex-wrap items-end gap-3 p-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/55">الكود الجديد</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
                placeholder="SUMMER20"
                dir="ltr"
                className="input-nova w-44 font-nova tracking-widest"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/55">نسبة الخصم %</label>
              <input
                type="number"
                min={1}
                max={90}
                value={newPercent}
                onChange={(e) => setNewPercent(e.target.value)}
                dir="ltr"
                className="input-nova w-28 font-nova"
              />
            </div>
            <button
              onClick={() => {
                const p = Math.max(1, Math.min(90, parseInt(newPercent) || 0));
                if (newCode.length >= 3) {
                  addCode({ code: newCode, percent: p, active: true });
                  setNewCode("");
                }
              }}
              className="btn-star h-12 px-6 text-sm"
            >
              إنشاء الكود
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {codes.map((c) => (
              <div key={c.code} className={`card-nova flex items-center justify-between p-5 ${!c.active ? "opacity-55" : ""}`}>
                <div>
                  <p className="font-nova text-lg font-semibold tracking-widest" dir="ltr">{c.code}</p>
                  <p className="text-xs text-white/45">خصم {c.percent}% — {c.active ? "فعّال" : "متوقف"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCode(c.code)}
                    className={`relative h-6.5 w-11 rounded-full transition-colors duration-300 ${c.active ? "bg-wa" : "bg-white/15"}`}
                    aria-label="تفعيل/إيقاف"
                  >
                    <span className={`absolute top-0.75 h-5 w-5 rounded-full bg-white transition-all duration-300 ${c.active ? "start-[22px]" : "start-1"}`} />
                  </button>
                  <button
                    onClick={() => removeCode(c.code)}
                    aria-label="حذف"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:border-red-400/50 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ---------------- تقارير الأكواد الشهرية ---------------- */}
      {tab === "reports" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-cairo text-xl font-extrabold">
                استخدام الأكواد — {jordanMonthLabel(currentKey)}
              </h2>
              <p className="mt-1 text-xs leading-6 text-white/45">
                تُحتسب المبالغ من الطلبات الفعلية حسب كل كود، ويُصفَّر العداد تلقائيًا في بداية كل شهر بتوقيت عمّان.
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-[11px] font-bold text-amber-200">
              <RotateCcw className="size-3.5" />
              التصفير القادم: ١ {jordanMonthLabel(nextMonthKey(currentKey))} — ١٢:٠٠ منتصف الليل
            </span>
          </div>

          {/* جدول الشهر الحالي */}
          <div className="card-nova mt-5 overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="th-nova">كود الخصم</th>
                  <th className="th-nova">النسبة</th>
                  <th className="th-nova">الحالة</th>
                  <th className="th-nova">مرات الاستخدام</th>
                  <th className="th-nova">المبلغ المستخدم فيه (د.أ)</th>
                  <th className="th-nova">قيمة الخصم الممنوح</th>
                  <th className="th-nova">آخر استخدام</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((r) => (
                  <tr key={r.code} className="border-b border-white/5 transition-colors hover:bg-white/3">
                    <td className="td-nova">
                      <span className="rounded-lg bg-white/8 px-3 py-1.5 font-nova text-sm font-semibold tracking-widest" dir="ltr">
                        {r.code}
                      </span>
                    </td>
                    <td className="td-nova font-nova font-semibold" dir="ltr">
                      {r.deleted ? "—" : `${r.percent}%`}
                    </td>
                    <td className="td-nova">
                      {r.deleted ? (
                        <span className="rounded-full border border-red-400/40 bg-red-400/10 px-3 py-1 text-[11px] font-bold text-red-300">محذوف</span>
                      ) : r.active ? (
                        <span className="rounded-full border border-wa/40 bg-wa/10 px-3 py-1 text-[11px] font-bold text-wa">فعّال</span>
                      ) : (
                        <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/50">متوقف</span>
                      )}
                    </td>
                    <td className="td-nova">
                      <span className="font-nova text-lg font-semibold tabular-nums">{r.count}</span>
                      <span className="ms-1 text-xs text-white/40">طلب</span>
                    </td>
                    <td className="td-nova">
                      <span className="font-nova text-lg font-semibold text-nova-dust tabular-nums">{jod(r.sales)}</span>
                    </td>
                    <td className="td-nova font-nova text-white/75 tabular-nums">{jod(r.discount)}</td>
                    <td className="td-nova text-xs text-white/45">{r.last ? timeAgo(r.last) : "لم يُستخدم هذا الشهر"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-white/4">
                  <td className="td-nova font-bold" colSpan={3}>إجمالي {jordanMonthLabel(currentKey)}</td>
                  <td className="td-nova font-nova text-lg font-semibold tabular-nums">{monthTotals.count}</td>
                  <td className="td-nova font-nova text-lg font-semibold text-nova-dust tabular-nums">{jod(monthTotals.sales)}</td>
                  <td className="td-nova font-nova font-semibold tabular-nums">{jod(monthTotals.discount)}</td>
                  <td className="td-nova" />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ملخص الشهر الماضي */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="card-nova p-5">
              <p className="text-[11px] font-bold tracking-wider text-white/40">الشهر الماضي — {jordanMonthLabel(prevKey)}</p>
              <p className="mt-2 font-nova text-2xl font-semibold text-nova-dust tabular-nums">{jod(prevTotals.sales)}</p>
              <p className="mt-1 text-xs text-white/45">إجمالي مبيعات عبر الأكواد ({prevTotals.count} طلب)</p>
            </div>
            <div className="card-nova p-5">
              <p className="text-[11px] font-bold tracking-wider text-white/40">أفضل كود الشهر الماضي</p>
              <p className="mt-2 font-nova text-2xl font-semibold tabular-nums" dir="ltr">{prevBest ? prevBest.code : "—"}</p>
              <p className="mt-1 text-xs text-white/45">{prevBest ? `${jod(prevBest.sales)} عبر ${prevBest.count} طلب` : "لا يوجد استخدام"}</p>
            </div>
            <div className="card-nova p-5">
              <p className="text-[11px] font-bold tracking-wider text-white/40">خصومات ممنوحة الشهر الماضي</p>
              <p className="mt-2 font-nova text-2xl font-semibold text-wa tabular-nums">{jod(prevTotals.discount)}</p>
              <p className="mt-1 text-xs text-white/45">أُرشفت تلقائيًا عند تصفير بداية الشهر</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
