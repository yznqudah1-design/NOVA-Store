/* ------------------------------------------------------------------ */
/*  NOVA STORE — مخطط قاعدة بيانات Supabase                           */
/*  الصق هذا الملف كاملًا في: SQL Editor ← New query ← Run              */
/*  جميع التواريخ والشهر محسوبة بتوقيت الأردن (Asia/Amman)             */
/* ------------------------------------------------------------------ */

-- البائعون
create table if not exists sellers (
  id          uuid primary key default gen_random_uuid(),
  store       text not null unique,
  field       text,
  username    text not null unique,        -- اسم الدخول المحدد
  password_hash text,                      -- استخدم bcrypt عبر دالة Edge أو pgcrypto
  phone       text,
  rating      numeric(2,1) default 0,
  commission  numeric(4,2) default 10,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- المنتجات
create table if not exists products (
  id          text primary key,
  name        text not null,
  category    text not null,               -- perfumes | electronics | fashion | grooming
  price       numeric(10,2) not null,
  old_price   numeric(10,2),
  rating      numeric(2,1) default 0,
  reviews     int default 0,
  img         text not null,
  seller      text not null,               -- اسم المتجر (مطابق sellers.store)
  seller_id   uuid references sellers(id) on delete set null,
  badge       text,
  description text,
  stock       int default 0,
  created_at  timestamptz default now()
);

-- الطلبات — مفتاح الشهر يُحسب تلقائيًا بتوقيت عمّان (لتقارير الأكواد الشهرية)
create table if not exists orders (
  id             text primary key,
  customer       jsonb not null,           -- {name, phone, city, address, university?, notes?}
  payment_method text not null check (payment_method in ('cliq','cod')),
  status         text default 'بانتظار الدفع',
  subtotal       numeric(10,2) not null,
  discount       numeric(10,2) default 0,
  code           text,                     -- كود الخصم المستخدم
  delivery_fee   numeric(10,2) default 0,
  total          numeric(10,2) not null,
  created_at     timestamptz default now(),
  month_key      text generated always as (to_char(created_at at time zone 'Asia/Amman','YYYY-MM')) stored
);

-- عناصر الطلب
create table if not exists order_items (
  id         bigint generated always as identity primary key,
  order_id   text references orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  name       text,
  price      numeric(10,2),
  qty        int
);

-- دفعات كليك (Nova962) — بانتظار تدقيق الإدارة
create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     text references orders(id) on delete cascade,
  invoice_no   text not null,              -- رقم الفاتورة/الحوالة
  sender_phone text not null,              -- هاتف المرسل للتواصل والتأكيد
  customer_name text,
  amount       numeric(10,2) not null,
  status       text default 'pending' check (status in ('pending','approved','rejected')),
  created_at   timestamptz default now()
);

-- أكواد الخصم
create table if not exists discount_codes (
  code       text primary key,
  percent    int not null check (percent between 1 and 90),
  active     boolean default true,
  created_at timestamptz default now()
);

/* فهارس لتسريع التقارير والفلاتر */
create index if not exists idx_products_seller  on products(seller);
create index if not exists idx_orders_month_key on orders(month_key);
create index if not exists idx_orders_code      on orders(code);
create index if not exists idx_payments_status  on payments(status);

/* تقرير استخدام الأكواد الشهري بتوقيت الأردن — جاهز كـ View */
create or replace view code_usage_monthly as
select
  month_key,
  code,
  count(*)          as uses_count,
  sum(total)        as total_sales,        -- المبلغ المستخدم فيه الكود
  sum(discount)     as total_discount      -- قيمة الخصم الممنوح
from orders
where code is not null
group by month_key, code
order by month_key desc, total_sales desc;
