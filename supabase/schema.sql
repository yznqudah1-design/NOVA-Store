/* ------------------------------------------------------------------ */
/*  NOVA STORE — مخطط قاعدة بيانات Supabase                           */
/*  الصق هذا الملف كاملًا في: SQL Editor ← New query ← Run              */
/*  ثم شغّل seed.sql لإضافة التصنيفات والمنتجات الحالية.                */
/*                                                                    */
/*  مبدأ الأمان:                                                       */
/*   - كل الجداول عليها RLS. الزائر (anon) يقرأ فقط: التصنيفات،        */
/*     المنتجات المفعّلة، المحافظات، الإعدادات العامة.                  */
/*   - سعر المورد والموردون في جداول لا يقرؤها إلا المدير.             */
/*   - الطلب يُنشأ فقط عبر دالة place_order التي تحسب الأسعار          */
/*     والخصم والتوصيل على الخادم (لا يُوثق بأي سعر من المتصفح).        */
/*   - المدير = مستخدم Supabase Auth موجود في جدول admins.             */
/*  جميع التواريخ محسوبة بتوقيت الأردن (Asia/Amman)                    */
/* ------------------------------------------------------------------ */

/* =========================== الإدارة =========================== */

create table if not exists admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table admins enable row level security;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

drop policy if exists admins_self_read on admins;
create policy admins_self_read on admins for select using (user_id = auth.uid());

/* =========================== التسعير =========================== */

/** سعر البيع الأدنى = سعر المورد × 1.20 مقرّبًا للأعلى لأقرب 0.5 د.أ */
create or replace function nova_price(supplier numeric) returns numeric
language sql immutable as $$
  select round(ceil(round(supplier * 1.20 * 100) / 50) / 2, 2);
$$;

/** الحد الأدنى المطلق بعد أي خصم = سعر المورد × 1.10 (مقرّب للأعلى للقرش) */
create or replace function nova_floor(supplier numeric) returns numeric
language sql immutable as $$
  select round(ceil(round(supplier * 1.10 * 1000) / 10) / 100, 2);
$$;

/* =========================== الكتالوج (عام) =========================== */

create table if not exists categories (
  id         text primary key,                 -- slug مثل perfumes
  name       text not null,                    -- عطور رجالي
  store_name text not null,                    -- Nova للعطور
  hint       text,
  color      text default '#c9b896',           -- لون شعار القسم
  sort       int default 0
);
alter table categories enable row level security;
drop policy if exists categories_read on categories;
create policy categories_read on categories for select using (true);
drop policy if exists categories_admin on categories;
create policy categories_admin on categories for all using (is_admin()) with check (is_admin());

create table if not exists products (
  id                     text primary key default ('p-' || substr(md5(gen_random_uuid()::text), 1, 8)),
  name                   text not null check (length(trim(name)) >= 3),
  category               text not null references categories(id),
  price                  numeric(10,2) not null check (price > 0),
  old_price              numeric(10,2) check (old_price is null or old_price > 0),
  img                    text not null,
  badge                  text,
  description            text,
  stock                  int not null default 0 check (stock >= 0),
  availability           text not null default 'in_stock' check (availability in ('in_stock','on_order')),
  prep_days              int not null default 1 check (prep_days between 0 and 60),
  is_original_guaranteed boolean not null default false,
  active                 boolean not null default true,
  rating_avg             numeric(2,1),             -- يُحدَّث تلقائيًا من جدول reviews فقط
  rating_count           int not null default 0,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);
alter table products enable row level security;
drop policy if exists products_read on products;
create policy products_read on products for select using (active or is_admin());
drop policy if exists products_admin on products;
create policy products_admin on products for all using (is_admin()) with check (is_admin());
create index if not exists idx_products_category on products(category);

create table if not exists cities (
  name text primary key,
  fee  numeric(10,2) not null check (fee >= 0),
  sort int default 0
);
alter table cities enable row level security;
drop policy if exists cities_read on cities;
create policy cities_read on cities for select using (true);
drop policy if exists cities_admin on cities;
create policy cities_admin on cities for all using (is_admin()) with check (is_admin());

/* إعدادات عامة يقرؤها الجميع ويعدّلها المدير (البانر الموسمي، حد التوصيل المجاني) */
create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);
alter table site_settings enable row level security;
drop policy if exists settings_read on site_settings;
create policy settings_read on site_settings for select using (true);
drop policy if exists settings_admin on site_settings;
create policy settings_admin on site_settings for all using (is_admin()) with check (is_admin());

/* =========================== الموردون (للمدير فقط) =========================== */

create table if not exists suppliers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  source_url text,                              -- صفحة فيسبوك / متجر المورد
  notes      text,
  active     boolean default true,
  created_at timestamptz default now()
);
alter table suppliers enable row level security;
drop policy if exists suppliers_admin on suppliers;
create policy suppliers_admin on suppliers for all using (is_admin()) with check (is_admin());

/* سعر المورد — جدول منفصل حتى لا يُرسل للمتصفح أبدًا لغير المدير */
create table if not exists product_costs (
  product_id     text primary key references products(id) on delete cascade,
  supplier_price numeric(10,2) not null check (supplier_price > 0),
  supplier_id    uuid references suppliers(id) on delete set null,
  supplier_url   text,                          -- رابط المنتج عند المورد
  updated_at     timestamptz default now()
);
alter table product_costs enable row level security;
drop policy if exists costs_admin on product_costs;
create policy costs_admin on product_costs for all using (is_admin()) with check (is_admin());

/* حماية الربح: لا يُسمح بسعر بيع أقل من سعر المورد × 1.10 */
create or replace function enforce_price_floor() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_price numeric;
  v_cost  numeric;
begin
  if tg_table_name = 'products' then
    v_price := new.price;
    select supplier_price into v_cost from product_costs where product_id = new.id;
    new.updated_at := now();
  else
    v_cost := new.supplier_price;
    select price into v_price from products where id = new.product_id;
    new.updated_at := now();
  end if;
  if v_cost is not null and v_price is not null and v_price < nova_floor(v_cost) then
    raise exception 'PRICE_BELOW_FLOOR: السعر % أقل من الحد الأدنى % (سعر المورد × 1.10)', v_price, nova_floor(v_cost)
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists trg_products_floor on products;
create trigger trg_products_floor before insert or update on products
  for each row execute function enforce_price_floor();
drop trigger if exists trg_costs_floor on product_costs;
create trigger trg_costs_floor before insert or update on product_costs
  for each row execute function enforce_price_floor();

/* =========================== أكواد الخصم (للمدير فقط) =========================== */

create table if not exists discount_codes (
  code       text primary key check (code = upper(code) and length(code) between 3 and 20),
  percent    int not null check (percent between 1 and 90),
  active     boolean default true,
  created_at timestamptz default now()
);
alter table discount_codes enable row level security;
drop policy if exists codes_admin on discount_codes;
create policy codes_admin on discount_codes for all using (is_admin()) with check (is_admin());

/* =========================== الطلبات (للمدير فقط) =========================== */

create table if not exists orders (
  id             text primary key,
  customer       jsonb not null,           -- {name, phone, city, address, university?, notes?}
  payment_method text not null check (payment_method in ('cliq','cod')),
  status         text not null default 'بانتظار الدفع'
                 check (status in ('بانتظار الدفع','قيد التجهيز','قيد التوصيل','مكتمل','ملغي')),
  subtotal       numeric(10,2) not null,
  discount       numeric(10,2) not null default 0,
  code           text,
  delivery_fee   numeric(10,2) not null default 0,
  total          numeric(10,2) not null,
  created_at     timestamptz default now(),
  month_key      text                      -- يُحسب بالـ trigger أدناه بتوقيت عمّان
);
alter table orders enable row level security;

create or replace function set_order_month_key() returns trigger
language plpgsql as $$
begin
  new.month_key := to_char(coalesce(new.created_at, now()) at time zone 'Asia/Amman', 'YYYY-MM');
  return new;
end $$;
drop trigger if exists trg_order_month_key on orders;
create trigger trg_order_month_key before insert or update of created_at on orders
  for each row execute function set_order_month_key();
drop policy if exists orders_admin on orders;
create policy orders_admin on orders for all using (is_admin()) with check (is_admin());
create index if not exists idx_orders_month_key on orders(month_key);
create index if not exists idx_orders_code on orders(code);
create index if not exists idx_orders_created on orders(created_at desc);

create table if not exists order_items (
  id             bigint generated always as identity primary key,
  order_id       text not null references orders(id) on delete cascade,
  product_id     text references products(id) on delete set null,
  name           text not null,
  img            text,
  unit_price     numeric(10,2) not null,
  qty            int not null check (qty between 1 and 9),
  discount       numeric(10,2) not null default 0,
  supplier_price numeric(10,2),             -- لقطة وقت الطلب — للمدير فقط
  availability   text,
  prep_days      int
);
alter table order_items enable row level security;
drop policy if exists order_items_admin on order_items;
create policy order_items_admin on order_items for all using (is_admin()) with check (is_admin());
create index if not exists idx_order_items_order on order_items(order_id);

create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null references orders(id) on delete cascade,
  invoice_no    text not null,
  sender_phone  text not null,
  customer_name text,
  amount        numeric(10,2) not null,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at    timestamptz default now()
);
alter table payments enable row level security;
drop policy if exists payments_admin on payments;
create policy payments_admin on payments for all using (is_admin()) with check (is_admin());
create index if not exists idx_payments_status on payments(status);

/* اعتماد الدفعة ينقل الطلب تلقائيًا إلى «قيد التجهيز» */
create or replace function on_payment_approved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update orders set status = 'قيد التجهيز' where id = new.order_id and status = 'بانتظار الدفع';
  end if;
  return new;
end $$;
drop trigger if exists trg_payment_approved on payments;
create trigger trg_payment_approved after update on payments
  for each row execute function on_payment_approved();

/* =========================== التقييمات الحقيقية =========================== */

/* تقييم واحد لكل منتج في كل طلب، ومن طلب مكتمل فقط.
   يضيفها المدير حاليًا (بعد التواصل مع الزبون)؛ لا يكتب الزوار هنا مباشرة. */
create table if not exists reviews (
  id         bigint generated always as identity primary key,
  product_id text not null references products(id) on delete cascade,
  order_id   text not null references orders(id) on delete cascade,
  rating     int not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz default now(),
  unique (product_id, order_id)
);
alter table reviews enable row level security;
drop policy if exists reviews_admin on reviews;
create policy reviews_admin on reviews for all using (is_admin()) with check (is_admin());

create or replace function check_review_order() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from orders o join order_items i on i.order_id = o.id
    where o.id = new.order_id and o.status = 'مكتمل' and i.product_id = new.product_id
  ) then
    raise exception 'REVIEW_NEEDS_COMPLETED_ORDER: التقييم يجب أن يرتبط بطلب مكتمل يحتوي هذا المنتج';
  end if;
  return new;
end $$;
drop trigger if exists trg_review_order on reviews;
create trigger trg_review_order before insert or update on reviews
  for each row execute function check_review_order();

create or replace function refresh_product_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid text := coalesce(new.product_id, old.product_id);
begin
  update products p set
    rating_count = s.c,
    rating_avg   = case when s.c > 0 then round(s.a, 1) end
  from (select count(*)::int c, avg(rating) a from reviews where product_id = pid) s
  where p.id = pid;
  return null;
end $$;
drop trigger if exists trg_review_rating on reviews;
create trigger trg_review_rating after insert or update or delete on reviews
  for each row execute function refresh_product_rating();

/* =========================== حساب الطلب على الخادم =========================== */

/*  items: [{"id":"p1","qty":2}, ...]
    يُرجع: {lines:[...], subtotal, discount, code, percent, delivery_fee, total}
    الخصم يُحسب لكل منتج على حدة، ولا يُنزل سعره تحت سعر المورد × 1.10 */
create or replace function compute_order(p_items jsonb, p_code text, p_city text, p_student boolean)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_percent   int := 0;
  v_code      text := nullif(upper(trim(coalesce(p_code, ''))), '');
  v_lines     jsonb := '[]'::jsonb;
  v_subtotal  numeric := 0;
  v_discount  numeric := 0;
  v_fee       numeric;
  v_threshold numeric;
  r           record;
  v_line_disc numeric;
  v_max_disc  numeric;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART: السلة فارغة';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'TOO_MANY_ITEMS: عدد المنتجات كبير جدًا';
  end if;

  if v_code is not null then
    select percent into v_percent from discount_codes where code = v_code and active;
    if not found then v_percent := 0; v_code := null; end if;
  end if;

  for r in
    select p.id, p.name, p.img, p.price, p.stock, p.availability, p.prep_days,
           c.supplier_price, it.qty
    from (select e->>'id' as pid, sum((e->>'qty')::int)::int as qty
          from jsonb_array_elements(p_items) e group by 1) it
    join products p on p.id = it.pid and p.active
    left join product_costs c on c.product_id = p.id
  loop
    if r.qty is null or r.qty < 1 or r.qty > 9 then
      raise exception 'BAD_QTY: كمية غير صحيحة';
    end if;
    if r.availability = 'in_stock' and r.stock < r.qty then
      raise exception 'OUT_OF_STOCK: الكمية المطلوبة من «%» غير متوفرة حاليًا', r.name;
    end if;

    v_line_disc := round(r.price * r.qty * v_percent / 100.0, 2);
    if r.supplier_price is not null then
      v_max_disc := greatest(0, (r.price - nova_floor(r.supplier_price)) * r.qty);
      v_line_disc := least(v_line_disc, v_max_disc);
    end if;

    v_subtotal := v_subtotal + r.price * r.qty;
    v_discount := v_discount + v_line_disc;
    v_lines := v_lines || jsonb_build_object(
      'id', r.id, 'name', r.name, 'img', r.img, 'unit_price', r.price, 'qty', r.qty,
      'discount', v_line_disc, 'supplier_price', r.supplier_price,
      'availability', r.availability, 'prep_days', r.prep_days);
  end loop;

  if jsonb_array_length(v_lines) <> (select count(distinct e->>'id') from jsonb_array_elements(p_items) e) then
    raise exception 'UNKNOWN_PRODUCT: أحد المنتجات لم يعد متوفرًا — حدّث السلة';
  end if;

  select fee into v_fee from cities where name = p_city;
  if not found then raise exception 'BAD_CITY: المحافظة غير معروفة'; end if;

  select coalesce((value #>> '{}')::numeric, 50) into v_threshold
    from site_settings where key = 'free_delivery_threshold';
  v_threshold := coalesce(v_threshold, 50);

  if coalesce(p_student, false) or v_subtotal - v_discount >= v_threshold then
    v_fee := 0;
  end if;

  return jsonb_build_object(
    'lines', v_lines,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'code', v_code,
    'percent', v_percent,
    'delivery_fee', v_fee,
    'total', v_subtotal - v_discount + v_fee);
end $$;
revoke all on function compute_order(jsonb, text, text, boolean) from public, anon, authenticated;

/* عرض سعر للسلة/صفحة الدفع — بدون سعر المورد */
create or replace function quote_order(p_items jsonb, p_code text, p_city text, p_student boolean)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare q jsonb;
begin
  q := compute_order(p_items, p_code, p_city, p_student);
  return jsonb_set(q, '{lines}', coalesce(
    (select jsonb_agg(l - 'supplier_price') from jsonb_array_elements(q->'lines') l), '[]'::jsonb));
end $$;
grant execute on function quote_order(jsonb, text, text, boolean) to anon, authenticated;

/* التحقق من كود الخصم دون كشف قائمة الأكواد */
create or replace function check_discount_code(p_code text) returns int
language sql stable security definer set search_path = public as $$
  select percent from discount_codes where code = upper(trim(p_code)) and active;
$$;
grant execute on function check_discount_code(text) to anon, authenticated;

/*  إنشاء الطلب — الطريقة الوحيدة لكتابة طلب من المتجر.
    p_customer: {name, phone, city, address, university?, notes?}
    p_payment:  {method: 'cliq'|'cod', invoice_no?, sender_phone?} */
create or replace function place_order(p_items jsonb, p_customer jsonb, p_payment jsonb, p_code text)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_name    text := trim(coalesce(p_customer->>'name', ''));
  v_phone   text := trim(coalesce(p_customer->>'phone', ''));
  v_city    text := trim(coalesce(p_customer->>'city', ''));
  v_address text := trim(coalesce(p_customer->>'address', ''));
  v_uni     text := nullif(trim(coalesce(p_customer->>'university', '')), '');
  v_notes   text := nullif(left(trim(coalesce(p_customer->>'notes', '')), 500), '');
  v_method  text := p_payment->>'method';
  v_invoice text := trim(coalesce(p_payment->>'invoice_no', ''));
  v_sender  text := trim(coalesce(p_payment->>'sender_phone', ''));
  v_student boolean;
  q         jsonb;
  v_id      text;
  l         jsonb;
begin
  if length(v_name) < 3 or length(v_name) > 80 then raise exception 'BAD_NAME: الاسم غير صحيح'; end if;
  if v_phone !~ '^07[0-9]{8}$' then raise exception 'BAD_PHONE: رقم الهاتف غير صحيح'; end if;
  if length(v_address) < 5 or length(v_address) > 300 then raise exception 'BAD_ADDRESS: العنوان غير صحيح'; end if;
  if v_method not in ('cliq','cod') then raise exception 'BAD_METHOD: طريقة دفع غير صحيحة'; end if;
  if v_method = 'cliq' and (length(v_invoice) < 4 or length(v_invoice) > 40 or v_sender !~ '^07[0-9]{8}$') then
    raise exception 'BAD_PAYMENT: بيانات حوالة كليك غير مكتملة';
  end if;

  /* حد بسيط ضد الإغراق: 5 طلبات لكل رقم خلال ساعة */
  if (select count(*) from orders
      where customer->>'phone' = v_phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'RATE_LIMIT: طلبات كثيرة من هذا الرقم — تواصل معنا عبر واتساب';
  end if;

  v_student := v_uni is not null or coalesce(v_notes, '') ~ 'جامع';
  q := compute_order(p_items, p_code, v_city, v_student);

  v_id := 'NV-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));

  insert into orders (id, customer, payment_method, status, subtotal, discount, code, delivery_fee, total)
  values (
    v_id,
    jsonb_strip_nulls(jsonb_build_object('name', v_name, 'phone', v_phone, 'city', v_city,
      'address', v_address, 'university', v_uni, 'notes', v_notes)),
    v_method,
    case when v_method = 'cliq' then 'بانتظار الدفع' else 'قيد التجهيز' end,
    (q->>'subtotal')::numeric, (q->>'discount')::numeric, q->>'code',
    (q->>'delivery_fee')::numeric, (q->>'total')::numeric);

  for l in select * from jsonb_array_elements(q->'lines') loop
    insert into order_items (order_id, product_id, name, img, unit_price, qty, discount, supplier_price, availability, prep_days)
    values (v_id, l->>'id', l->>'name', l->>'img', (l->>'unit_price')::numeric, (l->>'qty')::int,
            (l->>'discount')::numeric, (l->>'supplier_price')::numeric, l->>'availability', (l->>'prep_days')::int);
    update products set stock = greatest(0, stock - (l->>'qty')::int)
      where id = l->>'id' and availability = 'in_stock';
  end loop;

  if v_method = 'cliq' then
    insert into payments (order_id, invoice_no, sender_phone, customer_name, amount)
    values (v_id, v_invoice, v_sender, v_name, (q->>'total')::numeric);
  end if;

  return jsonb_build_object(
    'id', v_id,
    'status', case when v_method = 'cliq' then 'بانتظار الدفع' else 'قيد التجهيز' end,
    'subtotal', q->'subtotal', 'discount', q->'discount', 'code', q->'code',
    'delivery_fee', q->'delivery_fee', 'total', q->'total',
    'max_prep_days', (select max((x->>'prep_days')::int) from jsonb_array_elements(q->'lines') x),
    'has_on_order', exists (select 1 from jsonb_array_elements(q->'lines') x where x->>'availability' = 'on_order'));
end $$;
grant execute on function place_order(jsonb, jsonb, jsonb, text) to anon, authenticated;

/* =========================== حفظ منتج من الإدارة =========================== */

/* يحفظ المنتج وسعر المورد معًا في معاملة واحدة (إمّا الاثنان أو لا شيء).
   security invoker: يخضع لسياسات RLS، أي للمدير فقط. */
create or replace function admin_save_product(p jsonb, c jsonb) returns text
language plpgsql volatile security invoker set search_path = public as $$
declare
  v_id    text := coalesce(nullif(p->>'id', ''), 'p-' || substr(md5(gen_random_uuid()::text), 1, 8));
  v_avail text := coalesce(p->>'availability', 'in_stock');
begin
  if not is_admin() then raise exception 'NOT_ADMIN: للمدير فقط'; end if;

  delete from product_costs where product_id = v_id;

  insert into products (id, name, category, price, old_price, img, badge, description, stock,
                        availability, prep_days, is_original_guaranteed, active)
  values (
    v_id, trim(p->>'name'), p->>'category', (p->>'price')::numeric,
    nullif(p->>'old_price', '')::numeric, p->>'img', nullif(trim(coalesce(p->>'badge', '')), ''),
    nullif(trim(coalesce(p->>'description', '')), ''), coalesce((p->>'stock')::int, 0),
    v_avail,
    coalesce((p->>'prep_days')::int, case when v_avail = 'on_order' then 3 else 1 end),
    coalesce((p->>'is_original_guaranteed')::boolean, false),
    coalesce((p->>'active')::boolean, true))
  on conflict (id) do update set
    name = excluded.name, category = excluded.category, price = excluded.price,
    old_price = excluded.old_price, img = excluded.img, badge = excluded.badge,
    description = excluded.description, stock = excluded.stock,
    availability = excluded.availability, prep_days = excluded.prep_days,
    is_original_guaranteed = excluded.is_original_guaranteed, active = excluded.active;

  if c is not null and nullif(c->>'supplier_price', '') is not null then
    insert into product_costs (product_id, supplier_price, supplier_id, supplier_url)
    values (v_id, (c->>'supplier_price')::numeric, nullif(c->>'supplier_id', '')::uuid,
            nullif(trim(coalesce(c->>'supplier_url', '')), ''));
  end if;

  return v_id;
end $$;
revoke all on function admin_save_product(jsonb, jsonb) from public, anon;
grant execute on function admin_save_product(jsonb, jsonb) to authenticated;

/* =========================== التقارير =========================== */

/* تقرير استخدام الأكواد الشهري — security_invoker حتى يخضع لـ RLS (للمدير فقط) */
create or replace view code_usage_monthly with (security_invoker = true) as
select
  month_key,
  code,
  count(*)      as uses_count,
  sum(total)    as total_sales,
  sum(discount) as total_discount
from orders
where code is not null
group by month_key, code
order by month_key desc, total_sales desc;
