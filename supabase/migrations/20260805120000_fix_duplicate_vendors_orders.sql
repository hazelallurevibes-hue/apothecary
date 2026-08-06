-- Prevent / heal duplicate storefronts for same email + ensure buyer orders carry buyer_email
-- Canonical Alpha Bro for abeytamonico@yahoo.com is vendor id 2 (has listings + orders).

-- Heal known Alpha Bro split (safe if already applied)
UPDATE public.users
SET vendor_id = 2, role = 'vendor'
WHERE lower(email) = 'abeytamonico@yahoo.com'
  AND (vendor_id IS DISTINCT FROM 2 OR role IS DISTINCT FROM 'vendor');

UPDATE public.produce_items SET vendor_id = 2 WHERE vendor_id = 4;
UPDATE public.menu_items SET vendor_id = 2 WHERE vendor_id = 4;
UPDATE public.orders SET vendor_id = 2 WHERE vendor_id = 4;

UPDATE public.vendors
SET
  email = 'archived.alphabro.dup4@hazelallure.invalid',
  name = CASE
    WHEN name NOT ILIKE '%archived%' THEN name || ' (archived duplicate)'
    ELSE name
  END
WHERE id = 4
  AND email ILIKE 'abeytamonico@yahoo.com';

-- Backfill missing buyer_email on orders from users table
UPDATE public.orders o
SET buyer_email = u.email
FROM public.users u
WHERE o.user_id = u.id
  AND (o.buyer_email IS NULL OR trim(o.buyer_email) = '')
  AND u.email IS NOT NULL;

UPDATE public.orders
SET
  payment_method = COALESCE(payment_method, 'unknown'),
  payment_status = COALESCE(NULLIF(payment_status, ''), 'unpaid'),
  payment_note = COALESCE(payment_note, 'Recovered legacy checkout path')
WHERE id = 2 AND (buyer_email IS NULL OR payment_method IS NULL);

-- Helper: pick best vendor id for an email (most listings)
CREATE OR REPLACE FUNCTION public.resolve_vendor_id_for_email(p_email text)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id integer;
BEGIN
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN NULL;
  END IF;

  SELECT v.id INTO v_id
  FROM public.vendors v
  WHERE lower(v.email) = lower(trim(p_email))
    AND lower(coalesce(v.email, '')) NOT LIKE 'archived.%'
  ORDER BY (
    SELECT count(*) FROM public.produce_items p WHERE p.vendor_id = v.id
  ) + (
    SELECT count(*) FROM public.menu_items m WHERE m.vendor_id = v.id
  ) DESC,
  v.id ASC
  LIMIT 1;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_vendor_id_for_email(text) TO authenticated, anon, service_role;
