import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  Check,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Store,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import {
  cleanError,
  jod,
  jordanMonthKey,
  jordanMonthLabel,
  nextMonthKey,
  ORDER_STATUSES,
  prevMonthKey,
  timeAgo,
} from "../lib/data";
import type { AdminProduct, DiscountCode, Order, OrderStatus, Payment, SeasonalBanner, Supplier } from "../lib/data";
import { checkPrice, codeHitsFloor } from "../lib/pricing";
import { useShop } from "../lib/store";
import type { Api } from "../lib/api";
import JordanClock from "../components/JordanClock";
import StoreMark from "../components/StoreMark";
import ProductForm from "./admin/ProductForm";

type Tab = "overview" | "payments" | "orders" | "products" | "suppliers" | "codes" | "reports" | "banner";

const TABS: { id: Tab; label: string; icon: typeof Banknote }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "payments", label: "الدفعات", icon: Banknote },
  { id: "orders", label: "الطلبات", icon: ClipboardList },
  { id: "products", label: "المنتجات والأسعار", icon: Package },
  { id: "suppliers", label: "الموردون", icon: Store },
  { id: "codes", label: "أكواد الخصم", icon: TicketPercent },
  { id: "reports", label: "تقارير الأكواد", icon: BarChart3 },
  { id: "banner", label: "البانر الموسمي", icon: Megaphone },
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

export default function AdminPage() {
  const { isAdmin, api } = useShop();

  /* حارس الواجهة فقط — الحماية الحقيقية في سياسات RLS على الخادم:
     حتى لو تجاوز أحدهم هذه الشاشة لن يحصل على أي بيانات. */
  if (!isAdmin || !api) {
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
  return <Dashboard api={api} />;
}

function Dashboard({ api }: { api: Api }) {
  const { signOut, notify, categories, categoryOf, reloadCatalog, settings, adminEmail } = useShop();
  const [tab, setTab] = useState<Tab>("payments");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loadErr, setLoadErr] = useState("");

  const run = useCallback(
    async (fn: () => Promise<unknown>, ok?: string) => {
      try {
        await fn();
        if (ok) notify(ok);
        return true;
      } catch (e) {
        notify(`خطأ: ${cleanError(e)}`);
        return false;
      }
    },
    [notify]
  );

  const loadProducts = useCallback(async () => setProducts(await api.admin.listProducts()), [api]);
  const loadSuppliers = useCallback(async () => setSuppliers(await api.admin.listSuppliers()), [api]);
  const loadOrders = useCallback(async () => {
    const r = await api.admin.listOrders();
    setOrders(r.orders);
    setPayments(r.payments);
  }, [api]);
  const loadCodes = useCallback(async () => setCodes(await api.admin.listCodes()), [api]);

  useEffect(() => {
    Promise.all([loadProducts(), loadSuppliers(), loadOrders(), loadCodes()]).catch((e) => setLoadErr(cleanError(e)));
  }, [loadProducts, loadSuppliers, loadOrders, loadCodes]);

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const approvedTotal = payments.filter((p) => p.status === "approved").reduce((s, p) => s + p.amount, 0);
  const priceIssues = products.filter((p) => checkPrice(p.price, p.cost?.supplierPrice).level !== "ok").length;
  const missingCost = products.filter((p) => !p.cost).length;

  const stats = [
    { label: "دفعات بانتظار التدقيق", value: String(pendingCount), icon: Banknote, tint: "text-amber-200" },
    { label: "إجمالي الطلبات", value: String(orders.length), icon: ClipboardList, tint: "text-white" },
    { label: "مبيعات معتمدة (كليك)", value: jod(approvedTotal), icon: Check, tint: "text-wa" },
    { label: "منتجات بلا سعر مورد", value: String(missingCost), icon: AlertTriangle, tint: missingCost ? "text-amber-200" : "text-white/60" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">لوحة التحكم — إدارة الموقع فقط</span>
          <h1 className="mt-1 font-cairo text-3xl font-extrabold">مرحبًا أيها المدير</h1>
          {adminEmail && <p className="mt-1 text-xs text-white/40" dir="ltr">{adminEmail}</p>}
          <div className="mt-3">
            <JordanClock />
          </div>
        </div>
        <button onClick={() => signOut()} className="btn-ghost h-10 px-5 text-xs">
          <LogOut className="size-4" />
          تسجيل الخروج
        </button>
      </div>

      {loadErr && <p className="mt-4 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-300">تعذّر تحميل بيانات الإدارة: {loadErr}</p>}

      <div className="hide-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`chip shrink-0 ${tab === t.id ? "chip-active" : ""}`}>
              <Icon className="size-3.5" />
              {t.label}
              {t.id === "payments" && pendingCount > 0 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-300 text-[9px] font-bold text-black">{pendingCount}</span>
              )}
              {t.id === "products" && priceIssues > 0 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-400 text-[9px] font-bold text-black">{priceIssues}</span>
              )}
            </button>
          );
        })}
      </div>

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

      {tab === "payments" && (
        <PaymentsTab
          payments={payments}
          onSet={async (id, s) => {
            if (await run(() => api.admin.setPaymentStatus(id, s), s === "approved" ? "تم اعتماد الدفعة" : "تم رفض الدفعة")) loadOrders();
          }}
        />
      )}

      {tab === "orders" && (
        <OrdersTab
          orders={orders}
          onStatus={async (id, s) => {
            if (await run(() => api.admin.setOrderStatus(id, s), "تم تحديث حالة الطلب")) loadOrders();
          }}
        />
      )}

      {tab === "products" && (
        <ProductsTab
          api={api}
          products={products}
          suppliers={suppliers}
          categories={categories}
          categoryOf={categoryOf}
          onChanged={async () => {
            await loadProducts();
            await reloadCatalog();
          }}
          run={run}
        />
      )}

      {tab === "suppliers" && <SuppliersTab api={api} suppliers={suppliers} products={products} onChanged={loadSuppliers} run={run} />}

      {tab === "codes" && <CodesTab api={api} codes={codes} products={products} onChanged={loadCodes} run={run} />}

      {tab === "reports" && <ReportsTab orders={orders} codes={codes} />}

      {tab === "banner" && (
        <BannerTab
          initial={settings.seasonalBanner}
          onSave={async (b) => {
            if (await run(() => api.admin.saveBanner(b), "تم حفظ البانر")) reloadCatalog();
          }}
        />
      )}
    </div>
  );
}

/* ============================ الدفعات ============================ */

function PaymentsTab({ payments, onSet }: { payments: Payment[]; onSet: (id: string, s: "approved" | "rejected") => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <p className="mb-4 text-sm leading-7 text-white/50">
        كل دفعات كليك الواردة تظهر هنا — طابق رقم الفاتورة مع كشف المحفظة ثم اعتمدها أو ارفضها. الاعتماد ينقل الطلب تلقائيًا إلى «قيد التجهيز».
      </p>
      {payments.length === 0 ? (
        <div className="card-nova py-16 text-center text-white/45">لا توجد دفعات بعد</div>
      ) : (
        <div className="card-nova overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {["الطلب", "رقم الفاتورة", "هاتف المرسل", "الاسم", "المبلغ", "الوقت", "الحالة", "إجراء"].map((h) => (
                  <th key={h} className="th-nova">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-white/5 transition-colors hover:bg-white/3">
                  <td className="td-nova font-nova text-xs text-white/60" dir="ltr">{p.orderId}</td>
                  <td className="td-nova">
                    <span className="rounded-lg bg-white/8 px-2.5 py-1 font-nova text-xs font-semibold tracking-wider" dir="ltr">{p.invoiceNo}</span>
                  </td>
                  <td className="td-nova">
                    <a href={`tel:${p.senderPhone}`} className="font-nova font-semibold text-wa hover:underline" dir="ltr">{p.senderPhone}</a>
                  </td>
                  <td className="td-nova text-white/75">{p.customerName}</td>
                  <td className="td-nova font-nova font-semibold">{jod(p.amount)}</td>
                  <td className="td-nova text-xs text-white/45">{timeAgo(p.createdAt)}</td>
                  <td className="td-nova">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_STYLE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                  </td>
                  <td className="td-nova">
                    {p.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => onSet(p.id, "approved")} className="flex h-9 items-center gap-1 rounded-full bg-wa px-4 text-xs font-bold text-black transition hover:brightness-110">
                          <Check className="size-3.5" /> اعتماد
                        </button>
                        <button onClick={() => onSet(p.id, "rejected")} className="flex h-9 items-center gap-1 rounded-full border border-red-400/40 px-4 text-xs font-bold text-red-300 transition hover:bg-red-400/10">
                          <X className="size-3.5" /> رفض
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
  );
}

/* ============================ الطلبات ============================ */

function OrdersTab({ orders, onStatus }: { orders: Order[]; onStatus: (id: string, s: OrderStatus) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-3">
      {orders.length === 0 && <div className="card-nova py-16 text-center text-white/45">لا توجد طلبات بعد</div>}
      {orders.map((o) => {
        const cost = o.items.every((i) => i.supplierPrice !== undefined)
          ? o.items.reduce((s, i) => s + (i.supplierPrice ?? 0) * i.qty, 0)
          : null;
        const onOrder = o.items.filter((i) => i.availability === "on_order");
        return (
          <div key={o.id} className="card-nova p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-nova text-sm font-semibold text-nova-dust" dir="ltr">{o.id}</span>
                <span className="text-xs text-white/40">{timeAgo(o.createdAt)}</span>
                {onOrder.length > 0 && (
                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                    يحتاج تأمين من المورد ({onOrder.length})
                  </span>
                )}
              </div>
              <select
                value={o.status}
                onChange={(e) => onStatus(o.id, e.target.value as OrderStatus)}
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
                  {it.img && <img src={it.img} alt="" className="h-6 w-6 rounded-full object-cover" />}
                  {it.name} × {it.qty}
                  {it.availability === "on_order" && <span className="text-amber-200">• عند الطلب</span>}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-white/50">
              <span>الزبون: <span className="text-white/80">{o.customer.name}</span></span>
              <span>هاتف: <a href={`tel:${o.customer.phone}`} dir="ltr" className="font-nova text-white/80 hover:text-wa">{o.customer.phone}</a></span>
              <span>{o.customer.city} — {o.customer.address}</span>
              {o.customer.university && <span className="text-wa">{o.customer.university}</span>}
              <span>الدفع: {o.paymentMethod === "cliq" ? "كليك" : "عند الاستلام"}</span>
              {o.code && <span>كود: <span dir="ltr" className="font-nova text-nova-dust">{o.code}</span> (-{jod(o.discount)})</span>}
              {cost !== null && <span>ربح تقريبي: <span className="font-nova text-white/80">{jod(o.total - o.deliveryFee - cost)}</span></span>}
              <span className="ms-auto font-nova text-base font-semibold text-white">{jod(o.total)}</span>
            </div>
            {o.customer.notes && <p className="mt-2 text-xs text-white/45">ملاحظات: {o.customer.notes}</p>}
          </div>
        );
      })}
    </motion.div>
  );
}

/* ============================ المنتجات ============================ */

function ProductsTab({
  api, products, suppliers, categories, categoryOf, onChanged, run,
}: {
  api: Api;
  products: AdminProduct[];
  suppliers: Supplier[];
  categories: ReturnType<typeof useShop>["categories"];
  categoryOf: ReturnType<typeof useShop>["categoryOf"];
  onChanged: () => Promise<void>;
  run: (fn: () => Promise<unknown>, ok?: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const images = useMemo(() => [...new Set(products.map((p) => p.img))], [products]);
  const list = filter ? products.filter((p) => p.category === filter) : products;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-cairo text-xl font-extrabold">المنتجات والأسعار</h2>
          <p className="mt-1 text-xs leading-6 text-white/45">
            السعر المقترح = سعر المورد × 1.20 مقرّبًا لأعلى 0.5 د.أ. الخادم يرفض أي سعر أقل من سعر المورد × 1.10.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-11 rounded-full border border-white/15 bg-nova-deep px-4 text-xs font-bold outline-none [&>option]:bg-nova-deep">
            <option value="">كل الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.storeName}</option>
            ))}
          </select>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-star h-11 px-6 text-sm">
            <Plus className="size-4" /> إضافة منتج
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card-nova mt-5 py-16 text-center text-white/45">لا توجد منتجات في هذا القسم بعد</div>
      ) : (
        <div className="card-nova mt-5 overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {["المنتج", "القسم", "سعر المورد", "سعر البيع", "الربح", "التوفر", "المخزون", "الحالة", "إجراء"].map((h) => (
                  <th key={h} className="th-nova">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const check = checkPrice(p.price, p.cost?.supplierPrice);
                const margin = p.cost ? p.price - p.cost.supplierPrice : null;
                return (
                  <tr key={p.id} className={`border-b border-white/5 transition-colors hover:bg-white/3 ${!p.active ? "opacity-50" : ""}`}>
                    <td className="td-nova">
                      <span className="flex items-center gap-3">
                        <img src={p.img} alt="" className="h-11 w-11 rounded-xl object-cover" />
                        <span className="max-w-52 truncate text-sm font-bold">{p.name}</span>
                      </span>
                    </td>
                    <td className="td-nova"><StoreMark category={categoryOf(p.category)} size="xs" /></td>
                    <td className="td-nova font-nova text-xs">{p.cost ? jod(p.cost.supplierPrice) : <span className="text-amber-200">غير محدد</span>}</td>
                    <td className="td-nova">
                      <span className="font-nova font-semibold text-nova-dust">{jod(p.price)}</span>
                      {check.level !== "ok" && (
                        <span title={check.msg} className={`ms-2 inline-flex ${check.level === "error" ? "text-red-400" : "text-amber-300"}`}>
                          <AlertTriangle className="size-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="td-nova font-nova text-xs text-white/70">
                      {margin !== null && p.cost ? `${jod(margin)} (${Math.round((margin / p.cost.supplierPrice) * 100)}%)` : "—"}
                    </td>
                    <td className="td-nova text-xs">
                      {p.availability === "in_stock" ? <span className="text-wa">متوفر</span> : <span className="text-amber-200">عند الطلب · {p.prepDays} أيام</span>}
                      {p.isOriginalGuaranteed && <span className="ms-2 text-nova-dust">• أصلي</span>}
                    </td>
                    <td className="td-nova font-nova tabular-nums">{p.availability === "in_stock" ? p.stock : "—"}</td>
                    <td className="td-nova text-xs">{p.active ? "معروض" : "مخفي"}</td>
                    <td className="td-nova">
                      <span className="flex gap-2">
                        <button onClick={() => { setEditing(p); setOpen(true); }} className="flex h-9 items-center gap-1 rounded-full border border-white/15 px-4 text-xs font-bold transition hover:border-white/50">
                          <Pencil className="size-3.5" /> تعديل
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`حذف «${p.name}» نهائيًا؟`)) return;
                            if (await run(() => api.admin.deleteProduct(p.id), "تم حذف المنتج")) onChanged();
                          }}
                          aria-label="حذف"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:border-red-400/50 hover:text-red-400"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {createPortal(
      <AnimatePresence>
        {open && (
          <ProductForm
            api={api}
            editing={editing}
            categories={categories}
            suppliers={suppliers}
            imageChoices={images}
            onClose={() => setOpen(false)}
            onSaved={async () => {
              setOpen(false);
              await onChanged();
            }}
          />
        )}
      </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}

/* ============================ الموردون ============================ */

const emptySupplier = { name: "", phone: "", sourceUrl: "", notes: "" };

function SuppliersTab({
  api, suppliers, products, onChanged, run,
}: {
  api: Api;
  suppliers: Supplier[];
  products: AdminProduct[];
  onChanged: () => Promise<void>;
  run: (fn: () => Promise<unknown>, ok?: string) => Promise<boolean>;
}) {
  const [ns, setNs] = useState(emptySupplier);
  const [err, setErr] = useState("");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <div className="card-nova p-6">
        <h2 className="font-cairo text-lg font-extrabold">إضافة مورد</h2>
        <p className="mt-1 text-xs text-white/45">بيانات الموردين سرية — لا تظهر للزبائن ولا تُرسل لمتصفحاتهم.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} placeholder="اسم المورد *" className="input-nova" />
          <input value={ns.phone} onChange={(e) => setNs({ ...ns, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="07XXXXXXXX" dir="ltr" className="input-nova text-end font-nova" />
          <input value={ns.sourceUrl} onChange={(e) => setNs({ ...ns, sourceUrl: e.target.value })} placeholder="رابط الصفحة / المتجر" dir="ltr" className="input-nova text-end text-xs" />
          <input value={ns.notes} onChange={(e) => setNs({ ...ns, notes: e.target.value })} placeholder="ملاحظات (شروط الاتفاق…)" className="input-nova" />
        </div>
        {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
        <button
          onClick={async () => {
            if (ns.name.trim().length < 2) return setErr("أدخل اسم المورد");
            setErr("");
            if (await run(() => api.admin.saveSupplier({ name: ns.name.trim(), phone: ns.phone || undefined, sourceUrl: ns.sourceUrl.trim() || undefined, notes: ns.notes.trim() || undefined }), "تمت إضافة المورد")) {
              setNs(emptySupplier);
              onChanged();
            }
          }}
          className="btn-star mt-5 h-11 px-7 text-sm"
        >
          <Plus className="size-4" /> إضافة
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {suppliers.map((s) => {
          const count = products.filter((p) => p.cost?.supplierId === s.id).length;
          return (
            <div key={s.id} className={`card-nova p-5 ${!s.active ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-cairo font-extrabold">{s.name}</h3>
                  <p className="mt-1 text-xs text-white/45">{count} منتج مرتبط</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => { if (await run(() => api.admin.saveSupplier({ ...s, active: !s.active }))) onChanged(); }}
                    className="h-8 rounded-full border border-white/15 px-3 text-[11px] font-bold hover:border-white/40"
                  >
                    {s.active ? "إيقاف" : "تفعيل"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`حذف المورد «${s.name}»؟ تبقى منتجاته لكن بدون ربط بمورد.`)) return;
                      if (await run(() => api.admin.deleteSupplier(s.id), "تم حذف المورد")) onChanged();
                    }}
                    aria-label="حذف المورد"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 hover:border-red-400/50 hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/55">
                {s.phone && <a href={`tel:${s.phone}`} dir="ltr" className="font-nova hover:text-wa">{s.phone}</a>}
                {s.sourceUrl && (
                  <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    <ExternalLink className="size-3" /> الصفحة
                  </a>
                )}
                {s.notes && <span>{s.notes}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ============================ أكواد الخصم ============================ */

function CodesTab({
  api, codes, products, onChanged, run,
}: {
  api: Api;
  codes: DiscountCode[];
  products: AdminProduct[];
  onChanged: () => Promise<void>;
  run: (fn: () => Promise<unknown>, ok?: string) => Promise<boolean>;
}) {
  const [newCode, setNewCode] = useState("");
  const [newPercent, setNewPercent] = useState("10");
  const percentNum = Math.max(1, Math.min(90, parseInt(newPercent) || 0));
  const hits = (percent: number) => products.filter((p) => p.active && codeHitsFloor(p.price, p.cost?.supplierPrice, percent));
  const previewHits = hits(percentNum);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <div className="card-nova p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/55">الكود الجديد</label>
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20))}
              placeholder="WINTER10"
              dir="ltr"
              className="input-nova w-44 font-nova tracking-widest"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/55">نسبة الخصم %</label>
            <input type="number" min={1} max={90} value={newPercent} onChange={(e) => setNewPercent(e.target.value)} dir="ltr" className="input-nova w-28 font-nova" />
          </div>
          <button
            onClick={async () => {
              if (newCode.length < 3) return;
              if (await run(() => api.admin.saveCode({ code: newCode, percent: percentNum, active: true }), "تم حفظ كود الخصم")) {
                setNewCode("");
                onChanged();
              }
            }}
            className="btn-star h-12 px-6 text-sm"
          >
            إنشاء الكود
          </button>
        </div>
        {previewHits.length > 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-300/10 px-3 py-2 text-[12px] leading-6 text-amber-200">
            <AlertTriangle className="mt-1 size-3.5 shrink-0" />
            خصم {percentNum}% يُنزل {previewHits.length} منتج تحت الحد الأدنى (سعر المورد × 1.10). سيقيّد الخادم الخصم على هذه المنتجات تلقائيًا:
            {" "}{previewHits.slice(0, 4).map((p) => p.name).join("، ")}{previewHits.length > 4 ? "…" : ""}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {codes.map((c) => {
          const h = hits(c.percent).length;
          return (
            <div key={c.code} className={`card-nova p-5 ${!c.active ? "opacity-55" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-nova text-lg font-semibold tracking-widest" dir="ltr">{c.code}</p>
                  <p className="text-xs text-white/45">خصم {c.percent}% — {c.active ? "فعّال" : "متوقف"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => { if (await run(() => api.admin.saveCode({ ...c, active: !c.active }))) onChanged(); }}
                    className={`relative h-6.5 w-11 rounded-full transition-colors duration-300 ${c.active ? "bg-wa" : "bg-white/15"}`}
                    aria-label="تفعيل/إيقاف"
                  >
                    <span className={`absolute top-0.75 h-5 w-5 rounded-full bg-white transition-all duration-300 ${c.active ? "start-[22px]" : "start-1"}`} />
                  </button>
                  <button
                    onClick={async () => { if (await run(() => api.admin.deleteCode(c.code), "تم حذف الكود")) onChanged(); }}
                    aria-label="حذف"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:border-red-400/50 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {h > 0 && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-200">
                  <AlertTriangle className="size-3" /> يُقيَّد تلقائيًا على {h} منتج لحماية الربح
                </p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ============================ تقارير الأكواد ============================ */

function ReportsTab({ orders, codes }: { orders: Order[]; codes: DiscountCode[] }) {
  const currentKey = jordanMonthKey(Date.now());
  const usage = useMemo(() => {
    const map = new Map<string, { code: string; monthKey: string; count: number; sales: number; discount: number; last: number }>();
    for (const o of orders) {
      if (!o.code || o.status === "ملغي") continue;
      const monthKey = jordanMonthKey(o.createdAt);
      const id = `${monthKey}:${o.code}`;
      const cur = map.get(id) ?? { code: o.code, monthKey, count: 0, sales: 0, discount: 0, last: 0 };
      cur.count += 1;
      cur.sales += o.total;
      cur.discount += o.discount;
      cur.last = Math.max(cur.last, o.createdAt);
      map.set(id, cur);
    }
    return [...map.values()];
  }, [orders]);

  const rows = useMemo(() => {
    const r = codes.map((c) => {
      const u = usage.find((x) => x.monthKey === currentKey && x.code === c.code);
      return { code: c.code, percent: c.percent, active: c.active, deleted: false, count: u?.count ?? 0, sales: u?.sales ?? 0, discount: u?.discount ?? 0, last: u?.last ?? 0 };
    });
    for (const u of usage)
      if (u.monthKey === currentKey && !r.some((x) => x.code === u.code))
        r.push({ code: u.code, percent: 0, active: false, deleted: true, count: u.count, sales: u.sales, discount: u.discount, last: u.last });
    return r.sort((a, b) => b.sales - a.sales);
  }, [codes, usage, currentKey]);

  const totals = { count: rows.reduce((s, r) => s + r.count, 0), sales: rows.reduce((s, r) => s + r.sales, 0), discount: rows.reduce((s, r) => s + r.discount, 0) };
  const prevKey = prevMonthKey(currentKey);
  const prev = usage.filter((u) => u.monthKey === prevKey).sort((a, b) => b.sales - a.sales);
  const prevTotals = { count: prev.reduce((s, u) => s + u.count, 0), sales: prev.reduce((s, u) => s + u.sales, 0), discount: prev.reduce((s, u) => s + u.discount, 0) };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-cairo text-xl font-extrabold">استخدام الأكواد — {jordanMonthLabel(currentKey)}</h2>
          <p className="mt-1 text-xs leading-6 text-white/45">من الطلبات الفعلية (بدون الملغاة)، محسوبة بتوقيت عمّان.</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-[11px] font-bold text-amber-200">
          <RotateCcw className="size-3.5" />
          الشهر القادم: {jordanMonthLabel(nextMonthKey(currentKey))}
        </span>
      </div>

      <div className="card-nova mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              {["كود الخصم", "النسبة", "الحالة", "مرات الاستخدام", "المبيعات (د.أ)", "الخصم الممنوح", "آخر استخدام"].map((h) => (
                <th key={h} className="th-nova">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b border-white/5">
                <td className="td-nova"><span className="rounded-lg bg-white/8 px-3 py-1.5 font-nova text-sm font-semibold tracking-widest" dir="ltr">{r.code}</span></td>
                <td className="td-nova font-nova" dir="ltr">{r.deleted ? "—" : `${r.percent}%`}</td>
                <td className="td-nova text-xs">{r.deleted ? <span className="text-red-300">محذوف</span> : r.active ? <span className="text-wa">فعّال</span> : <span className="text-white/50">متوقف</span>}</td>
                <td className="td-nova font-nova tabular-nums">{r.count}</td>
                <td className="td-nova font-nova text-nova-dust tabular-nums">{jod(r.sales)}</td>
                <td className="td-nova font-nova text-white/75 tabular-nums">{jod(r.discount)}</td>
                <td className="td-nova text-xs text-white/45">{r.last ? timeAgo(r.last) : "لم يُستخدم هذا الشهر"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-white/4">
              <td className="td-nova font-bold" colSpan={3}>الإجمالي</td>
              <td className="td-nova font-nova font-semibold tabular-nums">{totals.count}</td>
              <td className="td-nova font-nova font-semibold text-nova-dust tabular-nums">{jod(totals.sales)}</td>
              <td className="td-nova font-nova font-semibold tabular-nums">{jod(totals.discount)}</td>
              <td className="td-nova" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card-nova p-5">
          <p className="text-[11px] font-bold text-white/40">الشهر الماضي — {jordanMonthLabel(prevKey)}</p>
          <p className="mt-2 font-nova text-2xl font-semibold text-nova-dust">{jod(prevTotals.sales)}</p>
          <p className="mt-1 text-xs text-white/45">مبيعات عبر الأكواد ({prevTotals.count} طلب)</p>
        </div>
        <div className="card-nova p-5">
          <p className="text-[11px] font-bold text-white/40">أفضل كود الشهر الماضي</p>
          <p className="mt-2 font-nova text-2xl font-semibold" dir="ltr">{prev[0]?.code ?? "—"}</p>
          <p className="mt-1 text-xs text-white/45">{prev[0] ? `${jod(prev[0].sales)} عبر ${prev[0].count} طلب` : "لا يوجد استخدام"}</p>
        </div>
        <div className="card-nova p-5">
          <p className="text-[11px] font-bold text-white/40">خصومات ممنوحة الشهر الماضي</p>
          <p className="mt-2 font-nova text-2xl font-semibold text-wa">{jod(prevTotals.discount)}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================ البانر الموسمي ============================ */

function BannerTab({ initial, onSave }: { initial: SeasonalBanner | null; onSave: (b: SeasonalBanner) => void }) {
  const [b, setB] = useState<SeasonalBanner>(
    initial ?? { enabled: true, title: "", subtitle: "", ctaLabel: "تسوّق الآن", ctaHref: "/products" }
  );
  const label = "mb-1.5 block text-xs font-semibold text-white/55";
  const hrefOk = b.ctaHref.startsWith("/");
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-nova mt-8 max-w-2xl p-6">
      <h2 className="font-cairo text-lg font-extrabold">البانر الموسمي في الصفحة الرئيسية</h2>
      <p className="mt-1 text-xs text-white/45">يظهر تحت الواجهة الرئيسية مباشرة. غيّره حسب الموسم أو أوقفه.</p>
      <div className="mt-5 space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={b.enabled} onChange={(e) => setB({ ...b, enabled: e.target.checked })} className="size-4 accent-[#25d366]" />
          إظهار البانر
        </label>
        <div>
          <label className={label}>العنوان</label>
          <input value={b.title} onChange={(e) => setB({ ...b, title: e.target.value })} className="input-nova" />
        </div>
        <div>
          <label className={label}>نص فرعي (اختياري)</label>
          <input value={b.subtitle ?? ""} onChange={(e) => setB({ ...b, subtitle: e.target.value })} className="input-nova" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>نص الزر</label>
            <input value={b.ctaLabel} onChange={(e) => setB({ ...b, ctaLabel: e.target.value })} className="input-nova" />
          </div>
          <div>
            <label className={label}>رابط الزر (داخل الموقع)</label>
            <input value={b.ctaHref} onChange={(e) => setB({ ...b, ctaHref: e.target.value.trim() })} dir="ltr" placeholder="/products?cat=umbrellas" className="input-nova text-end font-nova text-xs" />
            {!hrefOk && <p className="mt-1 text-[11px] text-red-400">يجب أن يبدأ بـ / مثل /products?cat=umbrellas</p>}
          </div>
        </div>
        <button disabled={!hrefOk || !b.title.trim()} onClick={() => onSave(b)} className="btn-star h-11 px-7 text-sm disabled:opacity-40">
          حفظ البانر
        </button>
      </div>
    </motion.div>
  );
}
