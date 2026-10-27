# NOVA STORE — بريقٌ لا يخبو

أول منصة تسوق أردنية متعددة البائعين: متجر كامل بإدارة المنتجات، بوابة بائعين، دفع كليك `Nova962`، تقارير أكواد شهرية بتوقيت عمّان، وعدّاد إطلاق حقيقي.

## التشغيل محليًا

```bash
npm install
npm run dev      # تطوير
npm run build    # بناء الإنتاج → dist/index.html (ملف واحد يحوي كل شيء)
```

## حسابات تجريبية

| الدور | البيانات |
|---|---|
| الإدارة | `admin@nova.jo` / `NOVA2026` |
| بائع (عطور ألفا) | `alpha` / `alpha123` |

---

## 1️⃣ رفع المشروع إلى GitHub

```bash
git init
git add .
git commit -m "NOVA STORE — الإطلاق الأول"
git branch -M main
git remote add origin https://github.com/<اسم-المستخدم>/nova-store.git
git push -u origin main
```

> أنشئ مستودعًا جديدًا من github.com/new باسم `nova-store` (لا تُنشئ README لأنه موجود هنا).

## 2️⃣ النشر على Cloudflare Pages

### الطريقة الأسهل (ربط GitHub — تحديث تلقائي مع كل push)

1. من لوحة Cloudflare: **Workers & Pages ← Create ← Pages ← Connect to Git**
2. اختر مستودع `nova-store`
3. الإعدادات:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy** — تحصل على رابط `nova-store.pages.dev` خلال دقيقة.
5. دومين مخصص: **Custom domains ← Set up a domain** (إن كان الدومين على Cloudflare يُربط تلقائيًا).

> ملاحظة: الموقع يستخدم HashRouter فلا يحتاج أي قواعد redirects، وملف `_headers` جاهز للتحديث الفوري.

### طريقة الرفع المباشر (بدون GitHub)

```bash
npm run build
npx wrangler pages deploy dist --project-name nova-store
```

## 3️⃣ ربط Supabase (قاعدة البيانات)

الموقع حاليًا يعمل كاملًا على localStorage. للانتقال لقاعدة بيانات حقيقية مشتركة:

1. من [supabase.com](https://supabase.com): **New project** — الاسم `nova-store`، والمنطقة الأقرب (يفضّل `Frankfurt / eu-central-1`).
2. من **SQL Editor ← New query**: الصق كامل محتوى [`supabase/schema.sql`](supabase/schema.sql) ثم **Run** — ينشئ الجداول + فهارس + تقرير الأكواد الشهري بتوقيت عمّان.
3. من **Settings ← API**: انسخ `Project URL` و `anon public` key.
4. في **Cloudflare Pages ← Settings ← Environment variables** (لـ Production و Preview):
   - `VITE_SUPABASE_URL` = رابط المشروع
   - `VITE_SUPABASE_ANON_KEY` = المفتاح العام
5. **Retry deployment** — وسيتحوّل العميل الجاهز في `src/lib/supabase.ts` للعمل تلقائيًا، ثم استبدل دوال `src/lib/store.tsx` تدريجيًا باستدعاءات Supabase.

## متغيرات البيئة

| المتغير | الوصف |
|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase |
| `VITE_SUPABASE_ANON_KEY` | المفتاح العام |

## التقنيات

React 19 · Vite 7 · Tailwind 4 · Framer Motion · HashRouter (جاهز لأي استضافة ثابتة) · صورة النجوم مضمّنة base64 داخل HTML

nova
