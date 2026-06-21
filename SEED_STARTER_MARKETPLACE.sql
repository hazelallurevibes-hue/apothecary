-- =====================================================
-- Bpicius — Starter marketplace content (optional, run once)
-- Generic real-sounding vendors — NOT demo personas (no Maria/Elena/etc.)
-- Requires vendors table + menu_items + produce_items from FINAL_SUPABASE_SETUP.sql
-- =====================================================

INSERT INTO public.vendors (name, category, status, email, logo, team_size, joined, bio)
VALUES
  ('Riverbend Farm', 'Produce & Eggs', 'approved', 'hello@riverbendfarm.local', 'https://picsum.photos/id/292/96/96', 3, to_char(NOW(), 'YYYY-MM-DD'), 'Family farm specializing in seasonal vegetables, free-range eggs, and raw honey.'),
  ('Oak Street Kitchen', 'Prepared Foods', 'approved', 'orders@oakstreetkitchen.local', 'https://picsum.photos/id/312/96/96', 2, to_char(NOW(), 'YYYY-MM-DD'), 'Small-batch meals made from locally sourced ingredients. Pickup and local delivery.'),
  ('Copper Kettle Bakery', 'Bakery', 'approved', 'bake@copperkettle.local', 'https://picsum.photos/id/225/96/96', 4, to_char(NOW(), 'YYYY-MM-DD'), 'Artisan breads, pastries, and weekend farmers market staples.')
ON CONFLICT DO NOTHING;

-- Ensure rows exist (vendors may lack unique email constraint)
INSERT INTO public.vendors (name, category, status, email, logo, team_size, joined, bio)
SELECT * FROM (VALUES
  ('Riverbend Farm', 'Produce & Eggs', 'approved', 'hello@riverbendfarm.local', 'https://picsum.photos/id/292/96/96', 3, to_char(NOW(), 'YYYY-MM-DD'), 'Family farm specializing in seasonal vegetables, free-range eggs, and raw honey.'),
  ('Oak Street Kitchen', 'Prepared Foods', 'approved', 'orders@oakstreetkitchen.local', 'https://picsum.photos/id/312/96/96', 2, to_char(NOW(), 'YYYY-MM-DD'), 'Small-batch meals made from locally sourced ingredients.'),
  ('Copper Kettle Bakery', 'Bakery', 'approved', 'bake@copperkettle.local', 'https://picsum.photos/id/225/96/96', 4, to_char(NOW(), 'YYYY-MM-DD'), 'Artisan breads and weekend market staples.')
) AS v(name, category, status, email, logo, team_size, joined, bio)
WHERE NOT EXISTS (SELECT 1 FROM public.vendors WHERE lower(vendors.name) = lower(v.name));

-- Menu items (linked to Oak Street + Copper Kettle)
INSERT INTO public.menu_items (vendor_id, name, photo, price, description, category, approved, dietary_tags, featured)
SELECT v.id, m.name, m.photo, m.price, m.description, m.category, 1, m.dietary_tags, m.featured
FROM public.vendors v
CROSS JOIN (VALUES
  ('Oak Street Kitchen', 'Harvest Grain Bowl', 'https://picsum.photos/id/312/400/300', 14.50, 'Roasted squash, farro, greens, and lemon tahini.', 'American', 'vegetarian,gluten-free', 1),
  ('Oak Street Kitchen', 'Smoked Trout Tacos', 'https://picsum.photos/id/326/400/300', 16.00, 'Three tacos with local trout, slaw, and cilantro lime.', 'American', '', 0),
  ('Oak Street Kitchen', 'Mushroom Risotto Cup', 'https://picsum.photos/id/431/400/300', 12.00, 'Creamy arborio with wild mushrooms and parmesan.', 'Italian', 'vegetarian', 0),
  ('Copper Kettle Bakery', 'Sourdough Loaf', 'https://picsum.photos/id/225/400/300', 8.50, '48-hour fermented country sourdough.', 'Bakery', 'vegan', 1),
  ('Copper Kettle Bakery', 'Seasonal Fruit Galette', 'https://picsum.photos/id/108/400/300', 9.00, 'Buttery crust with whatever is ripe this week.', 'Bakery', 'vegetarian', 1),
  ('Copper Kettle Bakery', 'Morning Bun', 'https://picsum.photos/id/145/400/300', 4.50, 'Cardamom-kissed laminated pastry.', 'Bakery', 'vegetarian', 0)
) AS m(vendor_name, name, photo, price, description, category, dietary_tags, featured)
WHERE lower(v.name) = lower(m.vendor_name)
  AND NOT EXISTS (SELECT 1 FROM public.menu_items mi WHERE mi.name = m.name AND mi.vendor_id = v.id);

-- Produce items (Riverbend Farm)
INSERT INTO public.produce_items (vendor_id, name, photo, price, unit, quantity_available, description, organic, category, approved, is_seasonal, season, dietary_tags, sustainability_score, featured)
SELECT v.id, p.name, p.photo, p.price, p.unit, p.qty, p.description, p.organic, p.category, 1, p.seasonal, p.season, p.dietary_tags, p.score, p.featured
FROM public.vendors v
CROSS JOIN (VALUES
  ('Riverbend Farm', 'Heirloom Tomatoes', 'https://picsum.photos/id/292/400/300', 4.50, 'lb', 80, 'Mixed varieties picked within 24 hours.', 1, 'Produce', 1, 'Summer', 'vegan,gluten-free', 92, 1),
  ('Riverbend Farm', 'Free-Range Eggs', 'https://picsum.photos/id/119/400/300', 6.00, 'dozen', 40, 'Pasture-raised, unwashed for longer shelf life.', 1, 'Eggs', 0, 'Year-round', 'vegetarian,gluten-free', 95, 1),
  ('Riverbend Farm', 'Raw Wildflower Honey', 'https://picsum.photos/id/312/400/300', 12.00, 'jar', 25, '16oz jar from on-farm hives.', 1, 'Pantry', 0, 'Year-round', 'vegan,gluten-free', 98, 0),
  ('Riverbend Farm', 'Spring Salad Mix', 'https://picsum.photos/id/108/400/300', 5.00, 'bag', 60, 'Washed and ready — feeds 2-3.', 1, 'Produce', 1, 'Spring', 'vegan,gluten-free', 90, 0),
  ('Riverbend Farm', 'Sweet Corn (6-pack)', 'https://picsum.photos/id/145/400/300', 7.00, 'pack', 35, 'Picked this morning. Boil or grill same day for best flavor.', 0, 'Produce', 1, 'Summer', 'vegan,gluten-free', 88, 1)
) AS p(vendor_name, name, photo, price, unit, qty, description, organic, category, seasonal, season, dietary_tags, score, featured)
WHERE lower(v.name) = lower(p.vendor_name)
  AND NOT EXISTS (SELECT 1 FROM public.produce_items pi WHERE pi.name = p.name AND pi.vendor_id = v.id);

SELECT
  (SELECT count(*) FROM public.vendors WHERE status = 'approved') AS approved_vendors,
  (SELECT count(*) FROM public.menu_items WHERE approved = 1) AS menu_items,
  (SELECT count(*) FROM public.produce_items WHERE approved = 1) AS produce_items;