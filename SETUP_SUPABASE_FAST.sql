-- =====================================================
-- Bpicius - Fast Supabase Setup Script
-- Run this ENTIRE script in Supabase SQL Editor (New query -> Paste -> Run)
-- This creates all tables with full schema + enables RLS + sets demo policies for anon access.
-- After running, use the SEED section below or insert via Table Editor.
-- =====================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor', 'customer', 'guest')),
  vendor_id INTEGER,
  avatar TEXT,
  password TEXT DEFAULT 'demo123',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  two_factor_enabled INTEGER DEFAULT 0,
  two_factor_secret TEXT
);

-- 2. VENDORS (includes profile + payment fields from enhancements)
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

-- 3. MENU_ITEMS (includes dietary + featured)
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

-- 4. PRODUCE_ITEMS (full fields for Farmers Market + B2B)
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

-- 5. ORDERS (for checkout)
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

-- 6. REVIEWS (with image support)
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

-- 7. VENDOR_PURCHASES (B2B feature)
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

-- 8. TASKS (for admin/vendor dashboard)
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  vendor_id INTEGER REFERENCES public.vendors(id),
  assignee TEXT,
  status TEXT DEFAULT 'todo',
  due TEXT
);

-- 9. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES public.vendors(id),
  amount REAL,
  status TEXT DEFAULT 'pending',
  date TEXT,
  due_date TEXT,
  file TEXT
);

-- 10. LOYALTY
CREATE TABLE IF NOT EXISTS public.loyalty (
  user_id INTEGER PRIMARY KEY,
  points INTEGER DEFAULT 0,
  last_updated TEXT
);

-- 11. ADS (front page promotion)
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

-- 12. DOCUMENTS (admin/vendor)
CREATE TABLE IF NOT EXISTS public.documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  vendor_id INTEGER,
  name TEXT,
  date TEXT,
  file_path TEXT
);

-- 13. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id INTEGER,
  menu_item_id INTEGER,
  PRIMARY KEY (user_id, menu_item_id)
);

-- 14. ISSUES (support)
CREATE TABLE IF NOT EXISTS public.issues (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  subject TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  date TEXT,
  related_order INTEGER
);

-- =====================================================
-- ENABLE RLS + DEMO POLICIES (fast & permissive for anon key)
-- This allows the Vercel frontend (using anon key) to read/write as needed.
-- For production, replace with stricter policies using auth.uid().
-- =====================================================

-- Enable RLS on all tables
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

-- PERMISSIVE POLICIES FOR DEMO (anon role)
-- Drop first to make re-runnable (avoids "already exists" errors)
DROP POLICY IF EXISTS "anon select vendors" ON public.vendors;
DROP POLICY IF EXISTS "anon select menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "anon select produce_items" ON public.produce_items;

DROP POLICY IF EXISTS "anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "anon select orders" ON public.orders;

DROP POLICY IF EXISTS "anon insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "anon select reviews" ON public.reviews;

DROP POLICY IF EXISTS "anon insert vendor_purchases" ON public.vendor_purchases;
DROP POLICY IF EXISTS "anon select vendor_purchases" ON public.vendor_purchases;

DROP POLICY IF EXISTS "anon select users" ON public.users;
DROP POLICY IF EXISTS "anon insert users" ON public.users;

DROP POLICY IF EXISTS "anon all tasks" ON public.tasks;
DROP POLICY IF EXISTS "anon all invoices" ON public.invoices;
DROP POLICY IF EXISTS "anon all loyalty" ON public.loyalty;
DROP POLICY IF EXISTS "anon all ads" ON public.ads;
DROP POLICY IF EXISTS "anon all documents" ON public.documents;
DROP POLICY IF EXISTS "anon all favorites" ON public.favorites;
DROP POLICY IF EXISTS "anon all issues" ON public.issues;

-- Public read for browsing
CREATE POLICY "anon select vendors" ON public.vendors FOR SELECT TO anon USING (true);
CREATE POLICY "anon select menu_items" ON public.menu_items FOR SELECT TO anon USING (true);
CREATE POLICY "anon select produce_items" ON public.produce_items FOR SELECT TO anon USING (true);

-- Allow inserts for orders, reviews, purchases (checkout + reviews + B2B)
CREATE POLICY "anon insert orders" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon select orders" ON public.orders FOR SELECT TO anon USING (true);

CREATE POLICY "anon insert reviews" ON public.reviews FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon select reviews" ON public.reviews FOR SELECT TO anon USING (true);

CREATE POLICY "anon insert vendor_purchases" ON public.vendor_purchases FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon select vendor_purchases" ON public.vendor_purchases FOR SELECT TO anon USING (true);

-- Users (for login query by email + basic)
CREATE POLICY "anon select users" ON public.users FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert users" ON public.users FOR INSERT TO anon WITH CHECK (true);

-- Other tables (admin/demo use)
CREATE POLICY "anon all tasks" ON public.tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon all invoices" ON public.invoices FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon all loyalty" ON public.loyalty FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon all ads" ON public.ads FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon all documents" ON public.documents FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon all favorites" ON public.favorites FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon all issues" ON public.issues FOR ALL TO anon USING (true) WITH CHECK (true);

-- Note: Realtime is enabled by default on these tables in Supabase.
-- If you need to toggle: Database > Replication in dashboard.

-- =====================================================
-- OPTIONAL: SEED MINIMAL DATA (run after tables)
-- Copy the INSERTs below and run separately if you want instant data.
-- Includes the new admin: username MKJR21 / password BlueCash7b!
-- =====================================================
/*
-- Admin user (MKJR21)
INSERT INTO public.users (name, email, role, password) VALUES 
('MKJR21', 'MKJR21@bpicius.com', 'admin', 'BlueCash7b!');

-- Other minimal users (for login buttons)
INSERT INTO public.users (name, email, role, vendor_id, avatar) VALUES 
('Luis Rivera', 'luis@bpicius.com', 'admin', NULL, 'https://i.pravatar.cc/32?img=68'),
('Elena Torres', 'elena@lacocina.com', 'vendor', 1, 'https://i.pravatar.cc/32?img=47'),
('Maria Gonzalez', 'maria@example.com', 'customer', NULL, 'https://i.pravatar.cc/32?img=40');

-- Minimal vendors
INSERT INTO public.vendors (name, category, status, email, phone, logo, team_size, joined) VALUES 
('La Cocina de Elena', 'Mexican', 'approved', 'elena@lacocina.com', '(505) 555-0142', 'https://i.pravatar.cc/48?img=47', 7, '2024-09-12'),
('Nonna''s Pasta', 'Italian', 'approved', 'nonna@pasta.com', '(505) 555-0198', 'https://i.pravatar.cc/48?img=28', 4, '2024-10-03');

-- Minimal menu items
INSERT INTO public.menu_items (vendor_id, name, photo, price, description, availability, time_made, category, approved) VALUES 
(1, 'Chicken Tamales', 'https://picsum.photos/id/292/300/200', 14, 'Slow-cooked chicken in corn masa', 'In stock', '45 min', 'Mexican', 1),
(2, 'Truffle Cacio e Pepe', 'https://picsum.photos/id/312/300/200', 19, 'Fresh handmade pasta', 'Limited', '18 min', 'Italian', 1);

-- Minimal produce
INSERT INTO public.produce_items (vendor_id, name, photo, price, unit, quantity_available, description, farm_story, organic, category) VALUES 
(1, 'Heirloom Tomatoes', 'https://picsum.photos/id/292/300/200', 4.50, 'lb', 120, 'Sweet, juicy, locally grown', 'Grown with love on our family farm in the valley since 1987.', 1, 'Vegetables'),
(2, 'Fresh Eggs (Dozen)', 'https://picsum.photos/id/312/300/200', 6.00, 'dozen', 40, 'Free-range, farm fresh', 'Our hens roam free on 10 acres.', 1, 'Dairy & Eggs');
*/
