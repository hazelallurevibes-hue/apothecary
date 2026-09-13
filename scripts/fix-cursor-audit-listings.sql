-- Clear leftover food-marketplace tags on apothecary SKUs and fill empty descriptions.
UPDATE public.produce_items
SET food_category = NULL
WHERE food_category IS NOT NULL;

UPDATE public.produce_items
SET description = 'Small-batch honey from a Hazel Allure maker.'
WHERE id = 2 AND (description IS NULL OR btrim(description) = '');

UPDATE public.produce_items
SET description = 'Everyday deodorant from a Hazel Allure maker. Not a food product.'
WHERE id = 3 AND (description IS NULL OR btrim(description) = '');

SELECT id, name, category, food_category, left(coalesce(description, ''), 80) AS description
FROM public.produce_items
ORDER BY id;
