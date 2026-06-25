-- My Likes & Dislikes, preorder modifications, easy mode
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS diet_type TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS disliked_foods TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS disliked_herbs TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS liked_foods TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS food_prefs_notes TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS food_prefs_completed_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS easy_mode_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS customer_region TEXT;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS modification_request TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS modification_status TEXT DEFAULT 'none';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS modification_vendor_note TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS modification_acknowledged BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rating_restricted BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS has_preorder_items BOOLEAN DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_modification_status_check') THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_modification_status_check
      CHECK (modification_status IN ('none', 'pending', 'approved', 'denied'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.vendor_customer_preference_insights(p_vendor_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_region TEXT;
  result JSONB;
BEGIN
  SELECT coalesce(v.plan, 'free'), coalesce(v.region, 'US')
  INTO v_plan, v_region
  FROM public.vendors v WHERE v.id = p_vendor_id;

  IF v_plan IS DISTINCT FROM 'paid' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Pro Vendor required for customer preference insights';
  END IF;

  SELECT jsonb_build_object(
    'region', v_region,
    'customer_count', cnt.total,
    'diets', diets.j,
    'top_disliked_foods', foods.j,
    'top_disliked_herbs', herbs.j,
    'common_allergens', allergens.j
  )
  INTO result
  FROM (
    SELECT count(*)::int AS total
    FROM public.users u
    WHERE u.role = 'customer'
      AND u.food_prefs_completed_at IS NOT NULL
      AND (p_vendor_id IS NULL OR coalesce(u.customer_region, 'US') = v_region OR u.customer_region IS NULL)
  ) cnt,
  (
    SELECT coalesce(jsonb_agg(jsonb_build_object('diet', diet_type, 'count', c)), '[]'::jsonb) AS j
    FROM (
      SELECT diet_type, count(*)::int AS c
      FROM public.users
      WHERE role = 'customer' AND food_prefs_completed_at IS NOT NULL AND diet_type IS NOT NULL AND diet_type <> ''
      GROUP BY diet_type ORDER BY c DESC LIMIT 12
    ) d
  ) diets,
  (
    SELECT coalesce(jsonb_agg(jsonb_build_object('item', token, 'count', c)), '[]'::jsonb) AS j
    FROM (
      SELECT lower(trim(token)) AS token, count(*)::int AS c
      FROM public.users u, unnest(string_to_array(coalesce(u.disliked_foods, ''), ',')) AS token
      WHERE u.role = 'customer' AND u.food_prefs_completed_at IS NOT NULL AND trim(token) <> ''
      GROUP BY 1 ORDER BY c DESC LIMIT 15
    ) f
  ) foods,
  (
    SELECT coalesce(jsonb_agg(jsonb_build_object('herb', token, 'count', c)), '[]'::jsonb) AS j
    FROM (
      SELECT lower(trim(token)) AS token, count(*)::int AS c
      FROM public.users u, unnest(string_to_array(coalesce(u.disliked_herbs, ''), ',')) AS token
      WHERE u.role = 'customer' AND u.food_prefs_completed_at IS NOT NULL AND trim(token) <> ''
      GROUP BY 1 ORDER BY c DESC LIMIT 15
    ) h
  ) herbs,
  (
    SELECT coalesce(jsonb_agg(jsonb_build_object('allergen', token, 'count', c)), '[]'::jsonb) AS j
    FROM (
      SELECT lower(trim(token)) AS token, count(*)::int AS c
      FROM public.users u, unnest(string_to_array(coalesce(u.allergen_avoid, ''), ',')) AS token
      WHERE u.role = 'customer' AND u.food_prefs_completed_at IS NOT NULL AND trim(token) <> ''
      GROUP BY 1 ORDER BY c DESC LIMIT 12
    ) a
  ) allergens;

  RETURN coalesce(result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.vendor_customer_preference_insights(INTEGER) TO authenticated;