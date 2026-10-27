import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  GraduationCap,
  Heart,
  Lock,
  Mail,
  Phone,
  Search,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import NovaLogo from "./NovaLogo";
import Stars from "./Stars";
import JordanClock from "./JordanClock";
import { EMAIL, WHATSAPP, WHATSAPP_INTL, CLIQ_ALIAS } from "../lib/data";
import { useShop } from "../lib/store";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function WhatsAppFAB() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_INTL}`}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="group fixed bottom-5 left-5 z-50 flex items-center gap-3"
    >
      <span className="pointer-events-none max-w-0 overflow-hidden rounded-full bg-white text-xs font-bold whitespace-nowrap text-black opacity-0 transition-all duration-500 group-hover:max-w-56 group-hover:px-4 group-hover:py-2.5 group-hover:opacity-100">
        راسلنا واتساب — {WHATSAPP}
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-wa text-white shadow-[0_8px_30px_rgba(37,211,102,0.45)] transition-transform duration-300 group-hover:scale-110">
        <span className="wa-ring absolute inset-0 rounded-full bg-wa" />
        <WhatsAppIcon className="relative size-7" />
      </span>
    </a>
  );
}

function Toasts() {
  const { toasts } = useShop();
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-nova-deep/95 px-5 py-2.5 text-sm font-semibold text-white shadow-2xl backdrop-blur-lg"
          >
            <CheckCircle2 className="size-4 text-wa" />
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Layout() {
  const { cartCount, wishlist } = useShop();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <div className="flex min-h-screen flex-col font-cairo text-white">
      <Stars />

      {/* الشريط العلوي */}
      <div className="relative z-40 border-b border-white/10 bg-nova-space/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-[11px] text-white/60 lg:px-6">
          <a
            href={`https://wa.me/${WHATSAPP_INTL}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-wa"
          >
            <Phone className="size-3" />
            <span dir="ltr">{WHATSAPP}</span>
            <span className="hidden sm:inline">— خدمة عملاء واتساب</span>
          </a>
          <span className="hidden items-center gap-1.5 md:flex">
            <GraduationCap className="size-3.5 text-nova-dust" />
            توصيل مجاني لطلاب الجامعات الأردنية
          </span>
          <span className="hidden lg:flex">
            <JordanClock compact />
          </span>
          <a href={`mailto:${EMAIL}`} className="items-center gap-1.5 transition-colors hover:text-white sm:flex">
            <Mail className="size-3" />
            <span dir="ltr">{EMAIL}</span>
          </a>
        </div>
      </div>

      {/* الهيدر */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-nova-space/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
          <Link to="/" aria-label="NOVA STORE" className="shrink-0 transition-transform duration-300 hover:scale-105">
            <NovaLogo size={110} />
          </Link>

          <form onSubmit={submitSearch} className="relative mx-auto hidden w-full max-w-lg md:block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في NOVA عن عطر، ساعة، سنيكرز..."
              className="h-11 w-full rounded-full border border-white/10 bg-nova-deep/70 pr-11 pl-5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/40"
            />
            <button
              type="submit"
              aria-label="بحث"
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/50 transition hover:text-white"
            >
              <Search className="size-5" />
            </button>
          </form>

          <div className="flex items-center gap-2.5">
            <Link
              to="/products?wish=1"
              aria-label="المفضلة"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-nova-deep/70 transition hover:border-white/40"
            >
              <Heart className="size-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-nova-dust text-[10px] font-bold text-black">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="السلة"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-nova-deep/70 transition hover:border-white/40"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-black">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/seller" aria-label="بوابة البائعين" className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-nova-deep/70 transition hover:border-nova-dust/60 hover:text-nova-dust sm:flex">
              <Store className="size-5" />
            </Link>
            <Link to="/login" className="btn-star hidden h-11 px-5 text-sm sm:inline-flex">
              <User className="size-4" />
              دخول
            </Link>
            <Link to="/admin" aria-label="لوحة الإدارة" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-nova-deep/70 transition hover:border-nova-dust/60 hover:text-nova-dust">
              <Lock className="size-4" />
            </Link>
          </div>
        </div>

        {/* بحث الجوال */}
        <form onSubmit={submitSearch} className="relative px-4 pb-3 md:hidden">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في NOVA..."
            className="h-11 w-full rounded-full border border-white/10 bg-nova-deep/70 pr-11 pl-5 text-sm outline-none placeholder:text-white/35 focus:border-white/40"
          />
          <Search className="absolute top-1/2 right-7.5 size-5 -translate-y-[calc(50%+6px)] text-white/50" />
        </form>
      </header>

      {/* المحتوى */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* الفوتر */}
      <footer className="relative z-10 mt-20 border-t border-white/10 bg-nova-space/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-4">
            <NovaLogo size={120} />
            <p className="mt-4 font-nova text-sm tracking-widest text-white/70">
              NOVA — A Shine That Never Fades<span className="text-nova-dust">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-white/55">
              أول منصة تسوق أردنية متعددة البائعين: أفضل المتاجر المحلية، أسعار بالدينار الأردني، وتوصيل لكل المحافظات.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-nova text-sm font-semibold tracking-wider text-nova-dust">تسوّق</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><Link to="/products" className="transition hover:text-white">كل المنتجات</Link></li>
              <li><Link to="/products?cat=perfumes" className="transition hover:text-white">عطور رجالي</Link></li>
              <li><Link to="/products?cat=electronics" className="transition hover:text-white">إلكترونيات</Link></li>
              <li><Link to="/cart" className="transition hover:text-white">سلة التسوق</Link></li>
              <li><Link to="/seller" className="transition hover:text-nova-dust">بوابة البائعين</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-nova text-sm font-semibold tracking-wider text-nova-dust">تواصل معنا</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-wa" />
                واتساب: <span dir="ltr" className="font-semibold text-white">{WHATSAPP}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" />
                <span dir="ltr">{EMAIL}</span>
              </li>
              <li className="flex items-center gap-2">
                <GraduationCap className="size-4 text-nova-dust" />
                توصيل مجاني: العلوم والتكنولوجيا + اليرموك
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-nova text-sm font-semibold tracking-wider text-nova-dust">الدفع</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-nova text-[9px] font-bold tracking-tight">CliQ</span>
                الدفع عبر كليك: <span dir="ltr" className="font-semibold text-white">{CLIQ_ALIAS}</span>
              </li>
              <li>محفظة أورانج موني أو بنك الاتحاد</li>
              <li>الدفع عند الاستلام متاح لكل الأردن</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
          © 2026 NOVA STORE — جميع الحقوق محفوظة في المجرة • صُنع في الأردن
        </div>
      </footer>

      <WhatsAppFAB />
      <Toasts />
    </div>
  );
}
