import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, SearchX, Sparkles } from "lucide-react";
import ProductCard from "../components/ProductCard";
import StoreMark from "../components/StoreMark";
import { WHATSAPP_INTL } from "../lib/data";
import { useShop } from "../lib/store";

type SortKey = "new" | "price-asc" | "price-desc" | "rating";

export default function ProductsPage() {
  const { products, wishlist, categories, categoryOf, storeNameOf } = useShop();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState<SortKey>("new");

  const q = params.get("q") ?? "";
  const catParam = params.get("cat");
  const cat = catParam && categoryOf(catParam) ? catParam : null;
  const currentCat = cat ? categoryOf(cat) : undefined;
  const wishOnly = params.get("wish") === "1";

  const filtered = useMemo(() => {
    let list = [...products];
    if (wishOnly) list = list.filter((p) => wishlist.includes(p.id));
    if (cat) list = list.filter((p) => p.category === cat);
    if (q.trim()) {
      const s = q.trim();
      list = list.filter((p) => p.name.includes(s) || p.desc.includes(s) || storeNameOf(p).includes(s));
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || b.ratingCount - a.ratingCount); break;
      default: break;
    }
    return list;
  }, [products, wishOnly, wishlist, cat, q, sort, storeNameOf]);

  const setCat = (c: string | null) => {
    const next = new URLSearchParams(params);
    if (c) next.set("cat", c); else next.delete("cat");
    setParams(next, { replace: true });
  };

  const comingSoon = !!currentCat && !wishOnly && !q && filtered.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {currentCat && !wishOnly ? (
              <StoreMark category={currentCat} size="lg" />
            ) : (
              <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">
                {wishOnly ? "قائمتك الخاصة" : q ? `نتائج البحث: «${q}»` : "مجرة المنتجات"}
              </span>
            )}
            <h1 className="mt-2 flex items-center gap-3 font-cairo text-3xl font-extrabold sm:text-4xl">
              {wishOnly && <Heart className="size-7 fill-red-400 text-red-400" />}
              {wishOnly ? "المفضلة" : currentCat ? currentCat.storeName : "كل المنتجات"}
            </h1>
            {currentCat && !wishOnly && <p className="mt-1 text-sm text-white/50">{currentCat.hint}</p>}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-11 rounded-full border border-white/12 bg-nova-deep px-5 text-sm font-semibold text-white/80 outline-none transition hover:border-white/40 [&>option]:bg-nova-deep"
          >
            <option value="new">الأحدث</option>
            <option value="rating">الأعلى تقييمًا</option>
            <option value="price-asc">السعر: من الأقل</option>
            <option value="price-desc">السعر: من الأعلى</option>
          </select>
        </div>

        {/* فلاتر الأقسام */}
        <div className="hide-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          <button onClick={() => setCat(null)} className={`chip ${!cat ? "chip-active" : ""}`}>
            الكل ({products.length})
          </button>
          {categories.map((c) => {
            const n = products.filter((p) => p.category === c.id).length;
            return (
              <button key={c.id} onClick={() => setCat(c.id)} className={`chip ${cat === c.id ? "chip-active" : ""}`}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name} {n > 0 ? `(${n})` : "· قريباً"}
              </button>
            );
          })}
        </div>
      </motion.div>

      {comingSoon ? (
        <div className="card-nova mt-10 flex flex-col items-center gap-4 px-6 py-20 text-center" style={{ borderColor: `${currentCat.color}40` }}>
          <Sparkles className="size-12" style={{ color: currentCat.color }} />
          <p className="font-cairo text-2xl font-extrabold">قريباً في Nova</p>
          <p className="max-w-sm text-sm leading-7 text-white/55">
            نجهّز تشكيلة {currentCat.storeName}: {currentCat.hint}. تبحث عن منتج معيّن؟ راسلنا ونؤمّنه لك عند الطلب.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(`أبحث عن منتج من ${currentCat.storeName}`)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-star h-11 text-sm"
            >
              <MessageCircle className="size-4" />
              اطلب عبر واتساب
            </a>
            <Link to="/products" className="btn-ghost h-11 text-sm">تصفّح باقي الأقسام</Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-nova mt-10 flex flex-col items-center gap-4 py-20 text-center">
          <SearchX className="size-12 text-white/25" />
          <p className="font-cairo text-xl font-bold text-white/70">
            {wishOnly ? "مفضلتك فارغة بعد" : "لا توجد نتائج مطابقة"}
          </p>
          <p className="max-w-sm text-sm text-white/45">
            {wishOnly
              ? "اضغط على القلب في أي منتج ليُحفظ هنا."
              : "جرّب كلمة بحث مختلفة أو تصفّح الأقسام."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
