import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { jod } from "../lib/data";
import type { Product } from "../lib/data";
import { useShop } from "../lib/store";
import StoreMark from "./StoreMark";
import { AvailabilityBadge, OriginalBadge, RealRating } from "./ProductBadges";

const canBuy = (p: Product) => p.availability === "on_order" || p.stock > 0;

function ProductModal({ p, onClose }: { p: Product; onClose: () => void }) {
  const { addToCart, categoryOf } = useShop();
  const [qty, setQty] = useState(1);
  const maxQty = p.availability === "in_stock" ? Math.min(9, p.stock) : 9;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="card-nova relative grid max-h-[92vh] w-full max-w-3xl grid-cols-1 overflow-y-auto sm:grid-cols-2"
      >
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur transition hover:text-white"
        >
          <X className="size-5" />
        </button>

        <div className="relative min-h-64 overflow-hidden sm:min-h-full sm:rounded-s-[24px]">
          <img src={p.img} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
          {p.badge && (
            <span className="absolute top-4 right-4 rounded-full bg-nova-dust px-3.5 py-1.5 text-[11px] font-bold text-black">
              {p.badge}
            </span>
          )}
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <StoreMark category={categoryOf(p.category)} />
          <h3 className="mt-3 font-cairo text-2xl font-extrabold leading-snug">{p.name}</h3>
          <div className="mt-2">
            <RealRating p={p} />
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="font-nova text-3xl font-semibold text-nova-dust">{jod(p.price)}</span>
            {p.oldPrice && p.oldPrice > p.price && (
              <span className="pb-1 text-sm text-white/40 line-through">{jod(p.oldPrice)}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <AvailabilityBadge p={p} />
            {p.isOriginalGuaranteed && <OriginalBadge />}
          </div>

          <p className="mt-4 text-sm leading-7 text-white/65">{p.desc}</p>

          {p.availability === "in_stock" && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 rounded-full ${p.stock > 5 ? "bg-wa" : p.stock > 0 ? "bg-amber-400" : "bg-red-400"}`} />
              <span className="text-white/55">
                {p.stock > 5 ? "متوفر في المخزون" : p.stock > 0 ? `بقي ${p.stock} فقط` : "نفدت الكمية حاليًا"}
              </span>
            </div>
          )}

          <div className="mt-auto flex items-center gap-3 pt-6">
            <div className="flex items-center rounded-full border border-white/15">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center text-white/70 hover:text-white" aria-label="إنقاص">
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center font-nova text-lg font-semibold tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(Math.max(1, maxQty), q + 1))} className="flex h-11 w-11 items-center justify-center text-white/70 hover:text-white" aria-label="زيادة">
                <Plus className="size-4" />
              </button>
            </div>
            <button
              disabled={!canBuy(p)}
              onClick={() => {
                addToCart(p.id, qty);
                onClose();
              }}
              className="btn-star h-12 flex-1 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <ShoppingCart className="size-4" />
              {canBuy(p) ? "أضف إلى السلة" : "غير متوفر"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { addToCart, wishlist, toggleWish, categoryOf } = useShop();
  const [open, setOpen] = useState(false);
  const wished = wishlist.includes(p.id);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
        className="group card-nova relative flex flex-col overflow-hidden transition-colors duration-300 hover:border-white/25"
      >
        <button onClick={() => setOpen(true)} className="relative block h-56 overflow-hidden text-start">
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nova-deep via-transparent to-transparent" />
          {p.badge && (
            <span className="absolute top-3 right-3 rounded-full bg-nova-dust px-3 py-1 text-[10px] font-bold text-black">
              {p.badge}
            </span>
          )}
        </button>

        <button
          onClick={() => toggleWish(p.id)}
          aria-label="المفضلة"
          className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 backdrop-blur transition hover:scale-110"
        >
          <Heart className={`size-4 transition ${wished ? "fill-red-400 text-red-400" : "text-white/80"}`} />
        </button>

        <div className="flex flex-1 flex-col p-4">
          <StoreMark category={categoryOf(p.category)} size="xs" />
          <button onClick={() => setOpen(true)} className="mt-2 text-start font-cairo text-[15px] font-bold leading-snug transition-colors hover:text-nova-dust">
            {p.name}
          </button>
          <div className="mt-2">
            <RealRating p={p} className="size-3" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <AvailabilityBadge p={p} compact />
            {p.isOriginalGuaranteed && <OriginalBadge compact />}
          </div>

          <div className="mt-auto flex items-center justify-between pt-4">
            <div>
              <span className="font-nova text-xl font-semibold text-nova-dust">{jod(p.price)}</span>
              {p.oldPrice && p.oldPrice > p.price && (
                <span className="ms-2 text-[11px] text-white/35 line-through">{jod(p.oldPrice)}</span>
              )}
            </div>
            <button
              onClick={() => addToCart(p.id)}
              disabled={!canBuy(p)}
              aria-label="أضف للسلة"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
            >
              <ShoppingCart className="size-4" />
            </button>
          </div>
        </div>
      </motion.article>

      {/* بوابة إلى body حتى تظهر النافذة فوق زر واتساب العائم */}
      {createPortal(
        <AnimatePresence>{open && <ProductModal p={p} onClose={() => setOpen(false)} />}</AnimatePresence>,
        document.body
      )}
    </>
  );
}
