/* ------------------------------------------------------------------ */
/*  قواعد التسعير — نفس المعادلات في supabase/schema.sql               */
/*  (nova_price و nova_floor). الخادم هو المرجع النهائي؛ هذه الدوال    */
/*  لعرض الاقتراحات والتحذيرات في لوحة الإدارة فقط.                    */
/* ------------------------------------------------------------------ */

/** هامش الربح الأدنى المقترح */
export const MARKUP = 1.2;
/** الحد الأدنى المطلق بعد أي خصم (يحمي الربح) */
export const FLOOR_MARKUP = 1.1;

/**
 * سعر البيع = سعر المورد × 1.20 مقرّبًا للأعلى لأقرب 0.5 د.أ.
 * التقريب إلى القروش أولًا ضروري: في JavaScript ‎25 * 1.2 = 30.000000000000004
 * فيصبح السعر 30.5 بدل 30 لو قرّبنا للأعلى مباشرة.
 */
export function novaPrice(supplierPrice: number): number {
  return Math.ceil(Math.round(supplierPrice * MARKUP * 100) / 50) / 2;
}

/** أدنى سعر مسموح بعد أي خصم = سعر المورد × 1.10 مقرّبًا للأعلى لأقرب قرش */
export function novaFloor(supplierPrice: number): number {
  return Math.ceil(Math.round(supplierPrice * FLOOR_MARKUP * 1000) / 10) / 100;
}

export type PriceCheck =
  | { level: "ok" }
  | { level: "warn"; msg: string }
  | { level: "error"; msg: string };

/** فحص سعر البيع مقابل سعر المورد (لرسائل التحذير في الإدارة) */
export function checkPrice(price: number, supplierPrice: number | null | undefined): PriceCheck {
  if (!supplierPrice || supplierPrice <= 0 || !price) return { level: "ok" };
  const floor = novaFloor(supplierPrice);
  const suggested = novaPrice(supplierPrice);
  if (price < floor)
    return { level: "error", msg: `السعر أقل من الحد الأدنى ${floor.toFixed(2)} د.أ (سعر المورد × 1.10) — سيرفض الخادم الحفظ.` };
  if (price < suggested)
    return { level: "warn", msg: `السعر أقل من السعر المقترح ${suggested.toFixed(2)} د.أ (سعر المورد × 1.20). الربح أقل من 20%.` };
  return { level: "ok" };
}

/** هل يُنزل كود الخصم سعر المنتج تحت الحد؟ (الخادم يقيّد الخصم تلقائيًا) */
export function codeHitsFloor(price: number, supplierPrice: number | null | undefined, percent: number): boolean {
  if (!supplierPrice) return false;
  return price * (1 - percent / 100) < novaFloor(supplierPrice);
}
