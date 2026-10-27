/* ------------------------------------------------------------------ */
/*  عميل Supabase — اختياري                                             */
/*  الموقع يعمل حاليًا على localStorage بالكامل. عند ربط Supabase:      */
/*  1) أضِف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في متغيرات        */
/*     البيئة في Cloudflare Pages (أو ملف .env محليًا)                  */
/*  2) شغّل schema.sql من مجلد supabase/                                */
/*  3) استبدل دوال store.tsx تدريجيًا باستدعاءات supabase               */
/* ------------------------------------------------------------------ */

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && anon ? createClient(url, anon) : null;

/** هل تم تفعيل Supabase؟ */
export const supabaseEnabled = supabase !== null;
