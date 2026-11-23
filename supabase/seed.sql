/* ------------------------------------------------------------------ */
/*  NOVA STORE — بيانات أولية. شغّله بعد schema.sql.                   */
/*  آمن لإعادة التشغيل: لا يستبدل ما عدّلته لاحقًا من لوحة الإدارة.     */
/* ------------------------------------------------------------------ */

insert into categories (id, name, store_name, hint, color, sort) values
  ('perfumes',    'عطور رجالي',      'Nova للعطور',          'تشكيلة عطور مختارة',                        '#c9b896', 1),
  ('electronics', 'إلكترونيات',      'Nova للإلكترونيات',    'أحدث الأجهزة والإكسسوارات',                 '#60a5fa', 2),
  ('fashion',     'أزياء',           'Nova للأزياء',         'ستايل يليق بك',                             '#f472b6', 3),
  ('grooming',    'عناية رجالية',    'Nova للعناية',         'أطقم وتفاصيل العناية اليومية',              '#34d399', 4),
  ('stationery',  'قرطاسية',         'Nova للقرطاسية',       'دفاتر وأقلام وأدوات مدرسية ومكتبية',        '#fbbf24', 5),
  ('printing',    'طباعة وورق',      'Nova للطباعة والورق',  'تجليد حراري A4، طباعة، ورق جوجو وورق A4',   '#a78bfa', 6),
  ('umbrellas',   'مظلات',           'Nova للمظلات',         'مظلات عملية لموسم الشتاء',                  '#38bdf8', 7),
  ('mind-games',  'ألعاب ذهنية',     'Nova للألعاب الذهنية', 'شطرنج وبازل وألعاب تعليمية',                '#fb923c', 8)
on conflict (id) do nothing;

insert into cities (name, fee, sort) values
  ('عمّان', 2, 1), ('إربد', 2.5, 2), ('الزرقاء', 2.5, 3), ('البلقاء', 3, 4),
  ('جرش', 3, 5), ('عجلون', 3, 6), ('المفرق', 3, 7), ('الكرك', 3, 8),
  ('مادبا', 3, 9), ('معان', 4, 10), ('العقبة', 4, 11)
on conflict (name) do nothing;

insert into site_settings (key, value) values
  ('free_delivery_threshold', '50'),
  ('seasonal_banner', jsonb_build_object(
    'enabled',   true,
    'title',     'الشتاء وصل ☔ — تشكيلة المظلات الآن في Nova',
    'subtitle',  'مظلات عملية لموسم الشتاء، بأسعار الدينار وتوصيل لكل المحافظات.',
    'cta_label', 'تسوّق المظلات',
    'cta_href',  '/products?cat=umbrellas'))
on conflict (key) do nothing;

insert into discount_codes (code, percent, active) values
  ('NOVA10', 10, true),
  ('WELCOME15', 15, true)
on conflict (code) do nothing;

/* المنتجات الحالية — بدون تقييمات (تُضاف فقط من طلبات حقيقية مكتملة).
   أدخل سعر المورد لكل منتج من لوحة الإدارة ← المنتجات. */
insert into products (id, name, category, price, old_price, img, badge, description, stock, availability, prep_days) values
  ('p1', 'ديور سوفاج — أو دو برفان', 'perfumes', 89, 110, 'https://images.pexels.com/photos/11216321/pexels-photo-11216321.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, '100 مل — توقيع العطور الرجالية الحديثة: برغموت حاد وقلب من الفلفل والأمبروكسان يدوم طوال اليوم.', 14, 'in_stock', 1),
  ('p2', 'شانيل بلو دو شانيل', 'perfumes', 95, null, 'https://images.pexels.com/photos/7850600/pexels-photo-7850600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, '100 مل — خشبي أروماتيك أنيق: حمضيات منعشة على قاعدة من خشب الصندل واللبان.', 9, 'in_stock', 1),
  ('p3', 'أرماني كود بروفومو', 'perfumes', 69, 82, 'https://images.pexels.com/photos/29805437/pexels-photo-29805437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, '110 مل — عطر سهرة شرقي: حبهان ولافندر مع قلب دافئ من حبوب التونكا.', 11, 'in_stock', 1),
  ('p4', 'باكو رابان ون مليون', 'perfumes', 59, null, 'https://images.pexels.com/photos/16239693/pexels-photo-16239693.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'عرض خاص', '100 مل — القارورة الذهبية الشهيرة: جريب فروت وقرفة وعنبر بشخصية لا تُنسى.', 17, 'in_stock', 1),
  ('p5', 'أرماني أكوا دي جيو بروفومو', 'perfumes', 72, null, 'https://images.pexels.com/photos/36779953/pexels-photo-36779953.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, '75 مل — نسيم البحر بطابع فاخر: نوتات بحرية مع باتشولي ولبان.', 8, 'in_stock', 1),
  ('p6', 'باكو رابان إنفكتوس', 'perfumes', 63, null, 'https://images.pexels.com/photos/15096784/pexels-photo-15096784.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, '100 مل — كأس الأبطال: غريب فروت وغواياك بروح رياضية منعشة.', 13, 'in_stock', 1),
  ('p7', 'إيف سان لوران واي', 'perfumes', 75, null, 'https://images.pexels.com/photos/36779955/pexels-photo-36779955.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, '100 مل — جرعة الثقة اليومية: زنجبيل وتفاح أخضر على قاعدة أمبروكسان.', 10, 'in_stock', 1),
  ('p8', 'فيكتور آند رولف سبايس بومب', 'perfumes', 66, 78, 'https://images.pexels.com/photos/26859235/pexels-photo-26859235.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, '90 مل — قنبلة التوابل: فلفل وقرفة وتبغ؛ دفء الخريف في زجاجة.', 7, 'in_stock', 1),
  ('e1', 'سماعات NovaBuds برو — عزل ضوضاء', 'electronics', 39, 55, 'https://images.pexels.com/photos/33936400/pexels-photo-33936400.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'خصم 29%', 'بلوتوث 5.3، بطارية 30 ساعة مع العلبة، ميكروفونات مزدوجة للمكالمات.', 22, 'in_stock', 1),
  ('e2', 'ساعة ذكية Ultra بشاشة أموليد', 'electronics', 89, null, 'https://images.pexels.com/photos/39076652/pexels-photo-39076652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, 'شاشة 1.96 إنش أموليد، قياس نبض وأكسجين، مقاومة للماء IP68، بطارية 10 أيام.', 15, 'in_stock', 1),
  ('e3', 'مكبر صوت كلاسيك بصوت ستيريو', 'electronics', 45, null, 'https://images.pexels.com/photos/14941998/pexels-photo-14941998.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, 'تصميم كلاسيكي أنيق، قدرة 40 واط، 18 ساعة تشغيل، يدعم AUX وبلوتوث.', 12, 'in_stock', 1),
  ('e4', 'بنك طاقة 20000mAh شحن سريع', 'electronics', 19, 25, 'https://images.pexels.com/photos/4072683/pexels-photo-4072683.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, 'شحن سريع 22.5W، منفذا USB + Type-C، شاشة عرض نسبة البطارية.', 30, 'in_stock', 1),
  ('f1', 'سنيكرز كلاسيك أبيض بكعب أزرق', 'fashion', 45, null, 'https://images.pexels.com/photos/11292946/pexels-photo-11292946.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'جديد', 'جلد صناعي فاخر ونعل مطاطي مريح، متوفر بالقياسات 40–45.', 18, 'in_stock', 1),
  ('f2', 'حقيبة ظهر جلدية للسفر', 'fashion', 35, null, 'https://images.pexels.com/photos/13870707/pexels-photo-13870707.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, 'جيوب متعددة وجيب لابتوب 15 إنش، خامة مقاومة للماء بحواف جلدية.', 10, 'in_stock', 1),
  ('f3', 'نظارة شمسية بإطار مودرن', 'fashion', 25, 32, 'https://images.pexels.com/photos/27353350/pexels-photo-27353350.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, 'عدسات UV400 مستقطبة مع علبة جلدية ومنديل تنظيف.', 20, 'in_stock', 1),
  ('g1', 'طقم عناية باللحية — 6 قطع', 'grooming', 27, null, 'https://images.pexels.com/photos/14649387/pexels-photo-14649387.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, 'زيت لحية، بلسم، شامبو، مشط خشبي، مقص وفرشاة — كل ما تحتاجه لحيتك.', 16, 'in_stock', 1),
  ('g2', 'طقم حلاقة كلاسيك بفرشاة خشبية', 'grooming', 16, null, 'https://images.pexels.com/photos/8789612/pexels-photo-8789612.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', null, 'فرشاة بمقبض خشبي وشعيرات ناعمة مع كريم حلاقة ووعاء تقديم.', 14, 'in_stock', 1)
on conflict (id) do nothing;

/* ------------------------------------------------------------------ */
/*  تعيين المدير — بعد إنشاء المستخدم من Authentication ← Users ← Add  */
/*  user (بريد + كلمة مرور قوية)، شغّل السطر التالي ببريدك:            */
/*                                                                    */
/*  insert into admins (user_id)                                      */
/*    select id from auth.users where email = 'YOUR-ADMIN-EMAIL';     */
/* ------------------------------------------------------------------ */
