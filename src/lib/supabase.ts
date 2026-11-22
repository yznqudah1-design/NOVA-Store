/* ------------------------------------------------------------------ */
/*  عميل Supabase                                                      */
/*  المتغيران في Cloudflare Pages ← Settings ← Environment variables:  */
/*    VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY                        */
/*  مفتاح anon عام بطبيعته (مسموح أن يظهر في المتصفح)، والحماية تتم    */
/*  بسياسات RLS في supabase/schema.sql. لا تضع أبدًا مفتاح              */
/*  service_role في الواجهة.                                           */
/* ------------------------------------------------------------------ */

import { createClient } from "@supabase/supabase-js";
import { createSupabaseApi } from "./api";
import type { Api } from "./api";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * يُرجع طبقة البيانات:
 *  - Supabase إن وُجد المتغيران
 *  - بيانات تجريبية في الذاكرة أثناء التطوير المحلي فقط (npm run dev)
 *  - null في نسخة الإنتاج بدون إعداد → تظهر صفحة «الإعداد غير مكتمل»
 */
export async function loadApi(): Promise<Api | null> {
  if (url && anon) {
    return createSupabaseApi(createClient(url, anon, { auth: { persistSession: true } }));
  }
  if (import.meta.env.DEV) {
    const { createMockApi } = await import("../dev/mockApi");
    return createMockApi();
  }
  return null;
}
