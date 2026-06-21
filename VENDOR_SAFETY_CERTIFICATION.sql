-- Vendor self-certification of food safety practices (platform does not verify)
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS safety_practices_certified BOOLEAN DEFAULT false;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS safety_practices_certified BOOLEAN DEFAULT false;