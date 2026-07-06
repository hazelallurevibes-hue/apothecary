-- Run in BPICIUS Supabase only — fixes footer/contact email contamination
UPDATE public.platform_settings
SET
  email_contact = 'support@bpicius.com',
  email_support = 'support@bpicius.com',
  email_noreply = 'noreply@bpicius.com',
  site_name = 'Bpicius',
  site_url = 'https://bpicius.com'
WHERE true;