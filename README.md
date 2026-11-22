# NOVA STORE — بريقٌ لا يخبو

منصة تسوق أردنية متعددة الأقسام: كل قسم متجر فرعي باسم Nova (Nova للعطور، Nova للإلكترونيات…)، دفع كليك `Nova962` أو عند الاستلام، وتقارير أكواد شهرية بتوقيت عمّان.

البيانات كلها في **Supabase**. الحماية على الخادم (سياسات RLS + دوال SQL)، وليست في JavaScript:

- الزائر يقرأ فقط: الأقسام، المنتجات المعروضة، المحافظات، الإعدادات العامة.
- **سعر المورد والموردون** في جداول لا يقرؤها إلا المدير (`product_costs`، `suppliers`).
- الطلب يُنشأ فقط عبر `place_order()` التي تحسب الأسعار والخصم والتوصيل على الخادم.
- لا يمكن حفظ سعر بيع أقل من سعر المورد × 1.10، وأكواد الخصم تُقيَّد تلقائيًا عند هذا الحد.
- المدير = مستخدم Supabase Auth مسجّل في جدول `admins`.

## التشغيل محليًا

```bash
npm install
npm run dev      # بدون متغيرات Supabase يعمل ببيانات تجريبية في الذاكرة (دخول الإدارة: أي بريد + كلمة المرور dev)
npm run build    # بناء الإنتاج → dist/index.html
```

## إعداد Supabase (مرة واحدة)

1. [supabase.com](https://supabase.com) ← **New project** (المنطقة المقترحة: `Frankfurt / eu-central-1`).
2. **SQL Editor ← New query**: الصق [`supabase/schema.sql`](supabase/schema.sql) ثم **Run**، ثم [`supabase/seed.sql`](supabase/seed.sql) ثم **Run**.
3. **Authentication ← Users ← Add user**: أنشئ حساب المدير ببريد وكلمة مرور قوية.
4. في SQL Editor شغّل (ببريدك):
   ```sql
   insert into admins (user_id) select id from auth.users where email = 'YOUR-ADMIN-EMAIL';
   ```
5. **Authentication ← Sign In / Providers**: أوقف **Allow new users to sign up** (لا حاجة لتسجيل عام).
6. **Settings ← API**: انسخ `Project URL` و `anon public` key.

## النشر على Cloudflare Pages

1. **Settings ← Environment variables** (لـ Production و Preview):
   - `VITE_SUPABASE_URL` = رابط المشروع
   - `VITE_SUPABASE_ANON_KEY` = المفتاح العام (anon)
2. **Build command:** `npm run build` — **Output:** `dist`.

> مفتاح `anon` عام بطبيعته ومسموح أن يظهر في المتصفح. **لا تضع أبدًا** مفتاح `service_role` في الواجهة أو في متغير يبدأ بـ `VITE_`.
> بدون المتغيرين تعرض نسخة الإنتاج صفحة «المتجر قيد الإعداد» مع رابط واتساب.

## التسعير

`سعر البيع = ceil(round(سعر المورد × 1.20 × 100) / 50) / 2` — أي ×1.20 مقرّبًا للأعلى لأقرب 0.5 د.أ.
أمثلة: 10 → 12، 25 → 30، 37 → 44.5، 74 → 89. المعادلة نفسها في `src/lib/pricing.ts` و `nova_price()` في SQL.

## التقنيات

React 19 · Vite 7 · Tailwind 4 · Framer Motion · Supabase · HashRouter
