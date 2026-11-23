import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Lock, ShieldCheck, User, UserRound } from "lucide-react";
import NovaLogo from "../components/NovaLogo";
import { cleanError } from "../lib/data";
import { useShop } from "../lib/store";

type Tab = "customer" | "admin";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("customer");
  const { setCustomer, signIn, notify, api } = useShop();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const customerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3 || !/^07\d{8}$/.test(phone)) {
      setErr("أدخل اسمًا صحيحًا ورقمًا أردنيًا يبدأ بـ 07");
      return;
    }
    setCustomer({ name: name.trim(), phone });
    notify(`أهلًا بك في NOVA يا ${name.trim().split(" ")[0]}`);
    navigate("/");
  };

  /* دخول الإدارة عبر Supabase Auth — كلمة المرور تُفحص على الخادم فقط */
  const doAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await signIn(email.trim(), pass);
      const admin = await api?.isAdmin();
      if (!admin) {
        setErr("هذا الحساب ليس حساب إدارة");
        return;
      }
      notify("تم تسجيل دخول الإدارة");
      navigate("/admin");
    } catch (e2) {
      setErr(cleanError(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="card-nova w-full max-w-md overflow-hidden"
      >
        <div className="flex flex-col items-center border-b border-white/10 px-8 pt-8 pb-6">
          <NovaLogo size={120} />
          <div className="mt-5 flex w-full rounded-full border border-white/10 bg-nova-purple/40 p-1">
            {(
              [
                { id: "customer", label: "العملاء", icon: UserRound },
                { id: "admin", label: "الإدارة", icon: Lock },
              ] as { id: Tab; label: string; icon: typeof User }[]
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setErr(""); }}
                  className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
                    tab === t.id ? "bg-white text-black" : "text-white/55 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-8">
          {tab === "customer" ? (
            <form onSubmit={customerLogin} className="space-y-4">
              <p className="text-sm leading-7 text-white/55">
                أدخل اسمك ورقمك الأردني وسنملأ بياناتك تلقائيًا عند إتمام الطلب (تُحفظ على جهازك فقط).
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/55">الاسم</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكريم" className="input-nova" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/55">رقم الهاتف</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="07XXXXXXXX"
                  dir="ltr"
                  className="input-nova text-end font-nova tracking-wider"
                />
              </div>
              {err && <p className="text-xs text-red-400">{err}</p>}
              <button type="submit" className="btn-star h-12 w-full">
                <User className="size-4" />
                متابعة
              </button>
            </form>
          ) : (
            <form onSubmit={doAdminLogin} className="space-y-4">
              <p className="flex items-start gap-2 rounded-2xl bg-white/5 p-4 text-[12px] leading-6 text-white/55">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-nova-dust" />
                منطقة خاصة بإدارة الموقع فقط: المنتجات والأسعار، الطلبات والدفعات، الموردون وأكواد الخصم.
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/55">البريد الإلكتروني</label>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="input-nova text-end"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/55">كلمة المرور</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="input-nova text-end"
                />
              </div>
              {err && <p className="text-xs text-red-400">{err}</p>}
              <button type="submit" disabled={busy} className="btn-star h-12 w-full disabled:opacity-50">
                <KeyRound className="size-4" />
                {busy ? "جارِ التحقق…" : "دخول لوحة التحكم"}
              </button>
              {api?.mode === "dev-mock" && (
                <p className="rounded-xl border border-amber-300/30 bg-amber-300/8 px-4 py-2.5 text-center text-[11px] text-amber-200">
                  وضع التطوير المحلي: أي بريد + كلمة المرور «dev»
                </p>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
