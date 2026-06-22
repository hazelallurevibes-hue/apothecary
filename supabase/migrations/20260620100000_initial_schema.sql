-- Hazel Allure — base marketplace schema (no Bpicius admin seed; use setup-admin-auth.js)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor', 'customer', 'guest')),
  vendor_id INTEGER,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  two_factor_enabled INTEGER DEFAULT 0,
  two_factor_secret TEXT
);

CREATE TABLE IF NOT EXISTS public.vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'approved',
  email TEXT,
  phone TEXT,
  logo TEXT,
  team_size INTEGER DEFAULT 1,
  joined TEXT,
  bio TEXT,
  highlight_photo TEXT,
  top_reviews TEXT,
  stripe_account_id TEXT,
  paypal_account_id TEXT
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES public.vendors(id),
  name TEXT NOT NULL,
  photo TEXT,
  price REAL,
  description TEXT,
  availability TEXT DEFAULT 'In stock',
  time_made TEXT,
  category TEXT,
  approved INTEGER DEFAULT 1,
  dietary_tags TEXT,
  featured INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.produce_items (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES public.vendors(id),
  name TEXT NOT NULL,
  photo TEXT,
  price REAL,
  unit TEXT DEFAULT 'lb',
  quantity_available INTEGER DEFAULT 50,
  description TEXT,
  farm_story TEXT,
  organic INTEGER DEFAULT 0,
  category TEXT DEFAULT 'Produce',
  approved INTEGER DEFAULT 1,
  dietary_tags TEXT,
  sustainability_score INTEGER DEFAULT 85,
  is_seasonal INTEGER DEFAULT 0,
  season TEXT,
  wholesale_price REAL,
  min_wholesale_qty INTEGER DEFAULT 20,
  featured INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  vendor_id INTEGER REFERENCES public.vendors(id),
  items TEXT,
  total REAL,
  status TEXT DEFAULT 'placed',
  date TEXT,
  delivery_method TEXT
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  item_id INTEGER,
  item_type TEXT DEFAULT 'menu',
  user_id INTEGER,
  rating INTEGER,
  comment TEXT,
  date TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS public.vendor_purchases (
  id SERIAL PRIMARY KEY,
  buyer_vendor_id INTEGER REFERENCES public.vendors(id),
  seller_vendor_id INTEGER REFERENCES public.vendors(id),
  item_id INTEGER,
  item_type TEXT,
  quantity INTEGER,
  price_per_unit REAL,
  total REAL,
  status TEXT DEFAULT 'pending',
  delivery_method TEXT,
  date TEXT,
  show_seller_badge INTEGER DEFAULT 0,
  seller_name_on_page TEXT
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  vendor_id INTEGER REFERENCES public.vendors(id),
  assignee TEXT,
  status TEXT DEFAULT 'todo',
  due TEXT
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES public.vendors(id),
  amount REAL,
  status TEXT DEFAULT 'pending',
  date TEXT,
  due_date TEXT,
  file TEXT
);

CREATE TABLE IF NOT EXISTS public.loyalty (
  user_id INTEGER PRIMARY KEY,
  points INTEGER DEFAULT 0,
  last_updated TEXT
);

CREATE TABLE IF NOT EXISTS public.ads (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES public.vendors(id),
  item_id INTEGER,
  item_type TEXT DEFAULT 'menu',
  duration_days INTEGER,
  cost REAL,
  start_date TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  vendor_id INTEGER,
  name TEXT,
  date TEXT,
  file_path TEXT
);

CREATE TABLE IF NOT EXISTS public.favorites (
  user_id INTEGER,
  menu_item_id INTEGER,
  PRIMARY KEY (user_id, menu_item_id)
);

CREATE TABLE IF NOT EXISTS public.issues (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  subject TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  date TEXT,
  related_order INTEGER
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "anon select vendors" ON public.vendors;
  DROP POLICY IF EXISTS "public read vendors" ON public.vendors;
  DROP POLICY IF EXISTS "anon select menu_items" ON public.menu_items;
  DROP POLICY IF EXISTS "public read menu_items" ON public.menu_items;
  DROP POLICY IF EXISTS "anon select produce_items" ON public.produce_items;
  DROP POLICY IF EXISTS "public read produce_items" ON public.produce_items;
  DROP POLICY IF EXISTS "anon insert orders" ON public.orders;
  DROP POLICY IF EXISTS "public insert orders" ON public.orders;
  DROP POLICY IF EXISTS "anon select orders" ON public.orders;
  DROP POLICY IF EXISTS "users select own orders" ON public.orders;
  DROP POLICY IF EXISTS "users manage own orders" ON public.orders;
  DROP POLICY IF EXISTS "anon insert reviews" ON public.reviews;
  DROP POLICY IF EXISTS "public insert reviews" ON public.reviews;
  DROP POLICY IF EXISTS "anon select reviews" ON public.reviews;
  DROP POLICY IF EXISTS "public select reviews" ON public.reviews;
  DROP POLICY IF EXISTS "users manage own reviews" ON public.reviews;
  DROP POLICY IF EXISTS "anon insert vendor_purchases" ON public.vendor_purchases;
  DROP POLICY IF EXISTS "public insert vendor_purchases" ON public.vendor_purchases;
  DROP POLICY IF EXISTS "anon select vendor_purchases" ON public.vendor_purchases;
  DROP POLICY IF EXISTS "public select vendor_purchases" ON public.vendor_purchases;
  DROP POLICY IF EXISTS "anon select users" ON public.users;
  DROP POLICY IF EXISTS "public select users for login" ON public.users;
  DROP POLICY IF EXISTS "anon insert users" ON public.users;
  DROP POLICY IF EXISTS "public insert users (signup)" ON public.users;
  DROP POLICY IF EXISTS "anon all tasks" ON public.tasks;
  DROP POLICY IF EXISTS "authenticated all tasks" ON public.tasks;
  DROP POLICY IF EXISTS "anon all invoices" ON public.invoices;
  DROP POLICY IF EXISTS "authenticated all invoices" ON public.invoices;
  DROP POLICY IF EXISTS "anon all loyalty" ON public.loyalty;
  DROP POLICY IF EXISTS "authenticated all loyalty" ON public.loyalty;
  DROP POLICY IF EXISTS "anon all ads" ON public.ads;
  DROP POLICY IF EXISTS "authenticated all ads" ON public.ads;
  DROP POLICY IF EXISTS "anon all documents" ON public.documents;
  DROP POLICY IF EXISTS "authenticated all documents" ON public.documents;
  DROP POLICY IF EXISTS "anon all favorites" ON public.favorites;
  DROP POLICY IF EXISTS "authenticated all favorites" ON public.favorites;
  DROP POLICY IF EXISTS "anon all issues" ON public.issues;
  DROP POLICY IF EXISTS "authenticated all issues" ON public.issues;
END $$;

CREATE POLICY "public read vendors" ON public.vendors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read menu_items" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read produce_items" ON public.produce_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "users select own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = (SELECT id FROM public.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' OR true));
CREATE POLICY "public insert reviews" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public select reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert vendor_purchases" ON public.vendor_purchases FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public select vendor_purchases" ON public.vendor_purchases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public select users for login" ON public.users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert users (signup)" ON public.users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "authenticated all tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated all invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated all loyalty" ON public.loyalty FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated all ads" ON public.ads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated all documents" ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated all favorites" ON public.favorites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated all issues" ON public.issues FOR ALL TO authenticated USING (true) WITH CHECK (true);