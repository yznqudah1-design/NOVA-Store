import { BadgeCheck, Clock, Star, Truck } from "lucide-react";
import type { Product } from "../lib/data";
import { availabilityLabel } from "../lib/data";

export function AvailabilityBadge({ p, compact = false }: { p: Product; compact?: boolean }) {
  const inStock = p.availability === "in_stock";
  const Icon = inStock ? Truck : Clock;
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border font-bold ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
      } ${inStock ? "border-wa/30 bg-wa/10 text-wa" : "border-amber-300/30 bg-amber-300/10 text-amber-200"}`}
    >
      <Icon className={compact ? "size-3" : "size-3.5"} />
      {availabilityLabel(p)}
    </span>
  );
}

export function OriginalBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border border-nova-dust/40 bg-nova-dust/10 font-bold text-nova-dust ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
      }`}
    >
      <BadgeCheck className={compact ? "size-3" : "size-3.5"} />
      أصلي مضمون
    </span>
  );
}

/** تقييم حقيقي فقط — لا يُعرض شيء إن لم توجد تقييمات من طلبات */
export function RealRating({ p, className = "size-3.5" }: { p: Product; className?: string }) {
  if (!p.ratingCount || p.ratingAvg === null) return null;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${className} ${i < Math.round(p.ratingAvg ?? 0) ? "fill-nova-dust text-nova-dust" : "text-white/20"}`}
          />
        ))}
      </div>
      <span className="text-[10px] text-white/45">
        {p.ratingAvg.toFixed(1)} ({p.ratingCount} {p.ratingCount === 1 ? "تقييم" : "تقييمات"})
      </span>
    </div>
  );
}
