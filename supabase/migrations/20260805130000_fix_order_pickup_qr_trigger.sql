-- Fix order insert failures: pickup QR trigger used gen_random_bytes without pgcrypto.
-- Symptom: place order errors with "function gen_random_bytes(integer) does not exist"
-- and vendors never see new orders.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.set_pickup_qr_on_order()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.delivery_method = 'pickup' AND (NEW.pickup_qr_token IS NULL OR btrim(NEW.pickup_qr_token) = '') THEN
    BEGIN
      NEW.pickup_qr_token := encode(extensions.gen_random_bytes(16), 'hex');
    EXCEPTION
      WHEN undefined_function OR undefined_object THEN
        -- Always-available fallback (no pgcrypto required)
        NEW.pickup_qr_token := replace(gen_random_uuid()::text, '-', '');
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_pickup_qr ON public.orders;
CREATE TRIGGER trg_set_pickup_qr
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_pickup_qr_on_order();
