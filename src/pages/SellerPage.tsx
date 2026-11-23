import { motion } from "framer-motion";
import { Boxes, CalendarCheck, MessageCircle, Store, Truck } from "lucide-react";
import { SUPPLIER_WA_TEXT, WHATSAPP, WHATSAPP_INTL } from "../lib/data";

/* بوابة الموردين — كل البيع يتم باسم Nova، والمورد يتعامل مع الإدارة مباشرة.
   لا توجد حسابات دخول للموردين: المنتجات والأسعار تُدار من لوحة الإدارة فقط. */

const STEPS = [
  { icon: Boxes, title: "ترسل لنا بضاعتك أو كتالوجك", desc: "صور وأسعار الجملة — أو نسحب المنتجات من صفحتك بالاتفاق معك." },
  { icon: Store, title: "نعرضها ونبيعها باسم Nova", desc: "ضمن القسم المناسب، بتسعير وتسويق من فريق Nova." },
  { icon: Truck, title: "نستلم ونوصّل للزبون", desc: "نؤمّن الطلب منك ونوصّله لكل المحافظات." },
  { icon: CalendarCheck, title: "تستلم حقك أسبوعياً", desc: "تسوية أسبوعية لكل الطلبات المكتملة." },
];

export default function SellerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 lg:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-black">
          <Store className="size-7" />
        </span>
        <span className="mt-5 block font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">بوابة الموردين</span>
        <h1 className="mt-2 font-cairo text-3xl font-extrabold sm:text-4xl">كن مورداً لـ Nova</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-white/60">
          عندك بضاعة؟ نعرضها ونبيعها ونوصّلها باسم Nova، وتستلم حقك أسبوعياً.
        </p>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card-nova flex gap-4 p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-nova-dust">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-cairo font-extrabold">
                  <span className="me-1 font-nova text-nova-dust">0{i + 1}</span> {s.title}
                </h3>
                <p className="mt-1 text-[13px] leading-6 text-white/55">{s.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="card-nova mt-8 flex flex-col items-center p-8 text-center">
        <p className="text-sm text-white/60">تواصل مع فريق الموردين مباشرة</p>
        <a
          href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(SUPPLIER_WA_TEXT)}`}
          target="_blank"
          rel="noreferrer"
          className="btn-star mt-4"
        >
          <MessageCircle className="size-5" />
          راسلنا على واتساب
        </a>
        <span className="mt-3 font-nova text-sm text-white/50" dir="ltr">{WHATSAPP}</span>
      </div>
    </div>
  );
}
