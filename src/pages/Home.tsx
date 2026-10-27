import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronLeft,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import NovaLogo from "../components/NovaLogo";
import Countdown from "../components/Countdown";
import ProductCard from "../components/ProductCard";
import { JUSTLogo, YULogo } from "../components/UniLogos";
import { CATEGORIES, WHATSAPP, WHATSAPP_INTL } from "../lib/data";
import { useShop } from "../lib/store";

const FEATURES = [
  {
    icon: Truck,
    title: "توصيل صاروخي",
    desc: "فريق NOVA الداخلي يوصّل لكل محافظات الأردن، وعمّان خلال ٢٤–٤٨ ساعة.",
  },
  {
    icon: ShieldCheck,
    title: "ضمان النجم",
    desc: "منتجات أصلية 100% وإرجاع مجاني خلال ١٤ يومًا بدون أسئلة.",
  },
  {
    icon: Wallet,
    title: "دفع مرن وآمن",
    desc: "كليك Nova962 عبر أورانج موني وبنك الاتحاد، أو الدفع عند الاستلام.",
  },
  {
    icon: MessageCircle,
    title: "دعم واتساب مباشر",
    desc: `فريقنا يرد عليك يوميًا على ${WHATSAPP} من ٩ صباحًا حتى ١١ مساءً.`,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  const { products } = useShop();
  const perfumes = products.filter((p) => p.category === "perfumes");
  const featured = products.filter((p) => p.category !== "perfumes").slice(0, 8);

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative flex min-h-[86vh] items-center justify-center overflow-hidden px-4 py-16 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-nova-space to-transparent" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="animate-float-slow flex justify-center"
          >
            <NovaLogo size={300} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-nova text-xl font-medium tracking-[0.18em] text-white/85 sm:text-2xl"
            dir="ltr"
          >
            NOVA <span className="text-white/30">—</span> A Shine That Never Fades
            <span className="text-nova-dust">.</span>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="mx-auto mt-5 h-px w-56 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          />

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/65 sm:text-lg"
          >
            بريقٌ لا يخبو — أول منصة تسوق أردنية متعددة البائعين تجمع لك أفضل المتاجر
            المحلية والمنتجات البريميوم في مكانٍ واحد، بأسعار الدينار وتوصيل لكل المحافظات.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/products" className="btn-star">
              <Sparkles className="size-5" />
              تسوّق الآن
            </Link>
            <a href={`https://wa.me/${WHATSAPP_INTL}`} target="_blank" rel="noreferrer" className="btn-ghost">
              <Store className="size-5" />
              انضم كبائع
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---------------- العدّاد ---------------- */}
      <section className="mx-auto max-w-4xl px-4 lg:px-6">
        <motion.div {...fadeUp}>
          <Countdown />
        </motion.div>
      </section>

      {/* ---------------- الميزات ---------------- */}
      <section className="mx-auto mt-16 max-w-7xl px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <div className="card-nova group h-full p-6 transition-colors duration-300 hover:border-white/25">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-nova-dust transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-nova text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-white/55">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------- الجامعات ---------------- */}
      <section className="mx-auto mt-20 max-w-7xl px-4 lg:px-6">
        <motion.div {...fadeUp}>
          <div className="card-nova relative overflow-hidden p-8 sm:p-12">
            <div className="pointer-events-none absolute -top-32 end-0 h-72 w-72 rounded-full bg-nova-dust/10 blur-[100px]" />
            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-nova-dust/40 px-4 py-1.5 text-xs font-bold text-nova-dust">
                  <GraduationCap className="size-4" />
                  مبادرة الطالب
                </span>
                <h2 className="mt-4 font-cairo text-3xl font-extrabold leading-snug sm:text-4xl">
                  التوصيل <span className="text-nova-dust">مجاني 100%</span>
                  <br />
                  لطلاب الجامعات الأردنية
                </h2>
                <p className="mt-4 max-w-md text-sm leading-8 text-white/60">
                  إذا كنت طالبًا في جامعة العلوم والتكنولوجيا أو جامعة اليرموك — أو أي جامعة
                  أردنية أخرى — اكتب اسم جامعتك في ملاحظات الطلب وسيصلك طلبك إلى الحرم
                  الجامعي بدون أي رسوم توصيل.
                </p>
                <Link to="/products" className="btn-star mt-6 h-11 text-sm">
                  اطلب الآن كطالب
                  <ArrowLeft className="size-4" />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-8 sm:gap-12">
                <div className="flex flex-col items-center gap-3">
                  <JUSTLogo size={110} />
                  <span className="rounded-full bg-white/5 px-4 py-1.5 text-[11px] font-bold text-white/70">
                    توصيل مجاني — إربد
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <YULogo size={110} />
                  <span className="rounded-full bg-white/5 px-4 py-1.5 text-[11px] font-bold text-white/70">
                    توصيل مجاني — إربد
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- التصنيفات ---------------- */}
      <section className="mx-auto mt-20 max-w-7xl px-4 lg:px-6">
        <motion.div {...fadeUp} className="flex items-end justify-between">
          <div>
            <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">تصفّح المجرة</span>
            <h2 className="mt-2 font-cairo text-3xl font-extrabold sm:text-4xl">التصنيفات</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white sm:flex">
            كل المنتجات
            <ChevronLeft className="size-4" />
          </Link>
        </motion.div>

        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <motion.div key={c.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <Link
                  to={`/products?cat=${c.id}`}
                  className="card-nova group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-nova-dust/50"
                >
                  <span className="font-nova text-4xl font-semibold text-white/10 transition-colors group-hover:text-nova-dust/30" dir="ltr">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 font-cairo text-lg font-extrabold">{c.name}</h3>
                  <p className="mt-1 text-xs text-white/45">{c.hint}</p>
                  <span className="mt-4 flex items-center gap-1 text-[11px] font-bold text-nova-dust">
                    {count} منتجات
                    <ChevronLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------- ركن عطور ألفا ---------------- */}
      <section className="mx-auto mt-20 max-w-7xl px-4 lg:px-6">
        <motion.div {...fadeUp} className="flex items-end justify-between">
          <div>
            <span className="flex items-center gap-2 font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">
              <BadgeCheck className="size-4" />
              بائع موثّق
            </span>
            <h2 className="mt-2 font-cairo text-3xl font-extrabold sm:text-4xl">
              ركن عطور ألفا <span className="text-nova-dust">— رجالي</span>
            </h2>
          </div>
          <Link to="/products?cat=perfumes" className="flex items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white">
            كل العطور
            <ChevronLeft className="size-4" />
          </Link>
        </motion.div>

        <div className="hide-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
          {perfumes.map((p, i) => (
            <div key={p.id} className="w-64 shrink-0 snap-start sm:w-72">
              <ProductCard p={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- منتجات مختارة ---------------- */}
      <section className="mx-auto mt-20 max-w-7xl px-4 lg:px-6">
        <motion.div {...fadeUp} className="flex items-end justify-between">
          <div>
            <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">مختارات الفريق</span>
            <h2 className="mt-2 font-cairo text-3xl font-extrabold sm:text-4xl">يتصاعد الآن</h2>
          </div>
          <Link to="/products" className="flex items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white">
            عرض الكل
            <ChevronLeft className="size-4" />
          </Link>
        </motion.div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      {/* ---------------- بانر البائعين ---------------- */}
      <section className="mx-auto mt-24 max-w-7xl px-4 lg:px-6">
        <motion.div {...fadeUp}>
          <div className="card-nova relative overflow-hidden p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-[42rem] max-w-full rounded-full bg-nova-dust/8 blur-[110px]" />
            </div>
            <div className="relative">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
                <Store className="size-6" />
              </span>
              <h2 className="mt-5 font-cairo text-3xl font-extrabold sm:text-4xl">عندك متجر؟ خلّيه يلمع مع NOVA</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-white/60">
                انضم لمنصة البائعين: نوصّل عنك، نسوّق لك، وأرباحك تصلك أسبوعيًا.
                التسجيل مجاني حتى الإطلاق الرسمي.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent("أرغب بالانضمام كبائع في NOVA STORE")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-star"
                >
                  <MessageCircle className="size-5" />
                  سجّل متجرك عبر واتساب
                </a>
                <Link to="/seller" className="btn-ghost">
                  <Store className="size-5" />
                  بوابة البائعين الحاليين
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
