import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, SearchX } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { CATEGORIES } from "../lib/data";
import type { CategoryId } from "../lib/data";
import { useShop } from "../lib/store";

type SortKey = "new" | "price-asc" | "price-desc" | "rating";

export default function ProductsPage() {
  const { products, wishlist } = useShop();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState<SortKey>("new");

  const q = params.get("q") ?? "";
  const cat = params.get("cat") as CategoryId | null;
  const wishOnly = params.get("wish") === "1";

  const filtered = useMemo(() => {
    let list = [...products];
    if (wishOnly) list = list.filter((p) => wishlist.includes(p.id));
    if (cat) list = list.filter((p) => p.category === cat);
    if (q.trim()) {
      const s = q.trim();
      list = list.filter((p) => p.name.includes(s) || p.desc.includes(s) || p.seller.includes(s));
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return list;
  }, [products, wishOnly, wishlist, cat, q, sort]);

  const setCat = (c: CategoryId | null) => {
    const next = new URLSearchParams(params);
    if (c) next.set("cat", c); else next.delete("cat");
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-nova text-xs font-semibold tracking-[0.3em] text-nova-dust">
              {wishOnly ? "قائمتك الخاصة" : q ? `نتائج البحث: «${q}»` : "مجرة المنتجات"}
            </span>
            <h1 className="mt-2 flex items-center gap-3 font-cairo text-3xl font-extrabold sm:text-4xl">
              {wishOnly && <Heart className="size-7 fill-red-400 text-red-400" />}
              {wishOnly ? "المفضلة" : "كل المنتجات"}
            </h1>
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

        {/* فلاتر التصنيف */}
        <div className="hide-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          <button onClick={() => setCat(null)} className={`chip ${!cat ? "chip-active" : ""}`}>
            الكل ({products.length})
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`chip ${cat === c.id ? "chip-active" : ""}`}>
              {c.name} ({products.filter((p) => p.category === c.id).length})
            </button>
          ))}
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="card-nova mt-10 flex flex-col items-center gap-4 py-20 text-center">
          <SearchX className="size-12 text-white/25" />
          <p className="font-cairo text-xl font-bold text-white/70">
            {wishOnly ? "مفضلتك فارغة بعد" : "لا توجد نتائج مطابقة"}
          </p>
          <p className="max-w-sm text-sm text-white/45">
            {wishOnly
              ? "اضغط على القلب في أي منتج ليُحفظ هنا."
              : "جرّب كلمة بحث مختلفة أو تصفّح التصنيفات."}
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
