-- Run after 11_vendor_listing_crud.sql — INSERT policies + listing RPC fallback
-- Same as migration 20260711120000_vendor_listing_insert_rls.sql

DROP POLICY IF EXISTS "authenticated insert menu_items" ON public.menu_items;
CREATE POLICY "authenticated insert menu_items" ON public.menu_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

DROP POLICY IF EXISTS "authenticated insert produce_items" ON public.produce_items;
CREATE POLICY "authenticated insert produce_items" ON public.produce_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

CREATE OR REPLACE FUNCTION public.assert_listing_write_access(
  p_email text,
  p_vendor_id integer
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_auth_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_resolved integer;
BEGIN
  IF coalesce(v_email, '') = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  IF v_auth_email <> '' AND v_auth_email <> v_email THEN
    RAISE EXCEPTION 'Email must match your signed-in account';
  END IF;

  IF public.is_admin() AND p_vendor_id IS NOT NULL THEN
    RETURN p_vendor_id;
  END IF;

  SELECT vendor_id INTO v_resolved
  FROM public.users
  WHERE lower(email) = v_email AND role IN ('vendor', 'admin')
  LIMIT 1;

  IF v_resolved IS NULL THEN
    SELECT vendor_id INTO v_resolved
    FROM public.vendor_employees
    WHERE lower(employee_email) = v_email AND coalesce(active, true) = true
    LIMIT 1;
  END IF;

  IF v_resolved IS NULL THEN
    RAISE EXCEPTION 'Not authorized to manage listings for this practice';
  END IF;

  IF p_vendor_id IS NOT NULL AND p_vendor_id IS DISTINCT FROM v_resolved THEN
    RAISE EXCEPTION 'vendor_id does not match your practice';
  END IF;

  RETURN v_resolved;
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_vendor_produce_listing(
  p_email text,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id integer;
  v_rec public.produce_items;
  v_row public.produce_items;
BEGIN
  v_vendor_id := public.assert_listing_write_access(p_email, (p_payload->>'vendor_id')::integer);
  v_rec := jsonb_populate_record(
    NULL::public.produce_items,
    p_payload || jsonb_build_object('vendor_id', v_vendor_id)
  );
  INSERT INTO public.produce_items SELECT v_rec.* RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_vendor_produce_listing(
  p_email text,
  p_edit_id integer,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id integer;
  v_rec public.produce_items;
  v_row public.produce_items;
BEGIN
  IF p_edit_id IS NULL THEN
    RAISE EXCEPTION 'Listing id is required for update';
  END IF;

  v_vendor_id := public.assert_listing_write_access(p_email, (p_payload->>'vendor_id')::integer);
  v_rec := jsonb_populate_record(
    NULL::public.produce_items,
    p_payload || jsonb_build_object('vendor_id', v_vendor_id)
  );

  UPDATE public.produce_items
  SET
    name = v_rec.name,
    price = v_rec.price,
    unit = COALESCE(v_rec.unit, unit),
    description = v_rec.description,
    farm_story = v_rec.farm_story,
    organic = COALESCE(v_rec.organic, organic),
    category = v_rec.category,
    photo = v_rec.photo,
    approved = COALESCE(v_rec.approved, approved),
    allergens = v_rec.allergens,
    harvest_date = v_rec.harvest_date,
    good_by_date = v_rec.good_by_date,
    storage_method = COALESCE(v_rec.storage_method, storage_method),
    storage_notes = v_rec.storage_notes,
    shelf_life_preset = v_rec.shelf_life_preset,
    listing_section = COALESCE(v_rec.listing_section, listing_section),
    is_preorder = COALESCE(v_rec.is_preorder, is_preorder),
    preorder_available_date = v_rec.preorder_available_date,
    preorder_max_qty = v_rec.preorder_max_qty,
    item_options = v_rec.item_options,
    last_activity_at = COALESCE(v_rec.last_activity_at, NOW()),
    fulfillment_mode = COALESCE(v_rec.fulfillment_mode, fulfillment_mode),
    service_video_url = v_rec.service_video_url,
    service_video_provider = v_rec.service_video_provider,
    media_type = COALESCE(v_rec.media_type, media_type),
    gallery_photos = v_rec.gallery_photos
  WHERE id = p_edit_id AND vendor_id = v_vendor_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or not owned by your practice';
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_vendor_menu_listing(
  p_email text,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id integer;
  v_rec public.menu_items;
  v_row public.menu_items;
BEGIN
  v_vendor_id := public.assert_listing_write_access(p_email, (p_payload->>'vendor_id')::integer);
  v_rec := jsonb_populate_record(
    NULL::public.menu_items,
    p_payload || jsonb_build_object('vendor_id', v_vendor_id)
  );
  INSERT INTO public.menu_items SELECT v_rec.* RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_vendor_menu_listing(
  p_email text,
  p_edit_id integer,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id integer;
  v_rec public.menu_items;
  v_row public.menu_items;
BEGIN
  IF p_edit_id IS NULL THEN
    RAISE EXCEPTION 'Listing id is required for update';
  END IF;

  v_vendor_id := public.assert_listing_write_access(p_email, (p_payload->>'vendor_id')::integer);
  v_rec := jsonb_populate_record(
    NULL::public.menu_items,
    p_payload || jsonb_build_object('vendor_id', v_vendor_id)
  );

  UPDATE public.menu_items
  SET
    name = v_rec.name,
    price = v_rec.price,
    description = v_rec.description,
    availability = COALESCE(v_rec.availability, availability),
    time_made = COALESCE(v_rec.time_made, time_made),
    category = v_rec.category,
    photo = v_rec.photo,
    approved = COALESCE(v_rec.approved, approved),
    allergens = v_rec.allergens,
    is_preorder = COALESCE(v_rec.is_preorder, is_preorder),
    preorder_available_date = v_rec.preorder_available_date,
    preorder_max_qty = v_rec.preorder_max_qty,
    item_options = v_rec.item_options,
    last_activity_at = COALESCE(v_rec.last_activity_at, NOW()),
    fulfillment_mode = COALESCE(v_rec.fulfillment_mode, fulfillment_mode),
    service_video_url = v_rec.service_video_url,
    service_video_provider = v_rec.service_video_provider,
    media_type = COALESCE(v_rec.media_type, media_type),
    gallery_photos = v_rec.gallery_photos
  WHERE id = p_edit_id AND vendor_id = v_vendor_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or not owned by your practice';
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.assert_listing_write_access(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_vendor_produce_listing(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_vendor_produce_listing(text, integer, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_vendor_menu_listing(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_vendor_menu_listing(text, integer, jsonb) TO anon, authenticated;