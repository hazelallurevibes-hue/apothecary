-- Fix overlapping fulfillment CHECK constraints (run if apothecary inserts fail)
-- Older migrations used produce_items_fulfillment_check; migration 27 only dropped *_fulfillment_mode_check.

UPDATE public.menu_items
SET fulfillment_mode = 'pickup_and_shipping'
WHERE fulfillment_mode IS NULL OR fulfillment_mode IN ('hazelallure', 'bpicius');

UPDATE public.produce_items
SET fulfillment_mode = 'pickup_and_shipping'
WHERE fulfillment_mode IS NULL OR fulfillment_mode IN ('hazelallure', 'bpicius');

ALTER TABLE public.menu_items ALTER COLUMN fulfillment_mode SET DEFAULT 'pickup_and_shipping';
ALTER TABLE public.produce_items ALTER COLUMN fulfillment_mode SET DEFAULT 'pickup_and_shipping';

ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_fulfillment_mode_check;
ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_fulfillment_check;
ALTER TABLE public.produce_items DROP CONSTRAINT IF EXISTS produce_items_fulfillment_mode_check;
ALTER TABLE public.produce_items DROP CONSTRAINT IF EXISTS produce_items_fulfillment_check;

ALTER TABLE public.menu_items
  ADD CONSTRAINT menu_items_fulfillment_mode_check
  CHECK (fulfillment_mode IN (
    'pickup_only', 'shipping', 'pickup_and_shipping',
    'external_only', 'hazelallure', 'bpicius'
  ));

ALTER TABLE public.produce_items
  ADD CONSTRAINT produce_items_fulfillment_mode_check
  CHECK (fulfillment_mode IN (
    'pickup_only', 'shipping', 'pickup_and_shipping',
    'external_only', 'hazelallure', 'bpicius'
  ));