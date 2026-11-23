import type { Category } from "../lib/data";

/** شعار نصي موحّد لكل قسم: «NOVA + اسم القسم» بلون القسم */
export default function StoreMark({ category, size = "sm" }: { category?: Category; size?: "xs" | "sm" | "lg" }) {
  const color = category?.color ?? "#c9b896";
  const name = category?.name ?? "";
  const cls =
    size === "lg"
      ? "gap-2 px-4 py-1.5 text-sm"
      : size === "sm"
        ? "gap-1.5 px-3 py-1 text-[11px]"
        : "gap-1 px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border font-semibold ${cls}`}
      style={{ borderColor: `${color}55`, backgroundColor: `${color}14` }}
      title={category?.storeName}
    >
      <span className="font-nova font-bold tracking-wider" style={{ color }} dir="ltr">
        NOVA
      </span>
      <span className="text-white/75">{name}</span>
    </span>
  );
}
