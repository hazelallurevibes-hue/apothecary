-- Hazel Allure — verify schema after running numbered SQL files
-- Run in SQL Editor; read the results table

SELECT 'users' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN 'OK' ELSE 'MISSING' END AS status
UNION ALL
SELECT 'vendors', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vendors') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'vendor_courses', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vendor_courses') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'practitioner_session_slots', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='practitioner_session_slots') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'practitioner_bookings', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='practitioner_bookings') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'vendor_courses.delivery_modes', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vendor_courses' AND column_name='delivery_modes') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'users.preferred_learning_styles', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='preferred_learning_styles') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'site_url setting', COALESCE((SELECT value FROM public.platform_settings WHERE key='site_url' LIMIT 1), 'MISSING')
UNION ALL
SELECT 'vertical_id setting', COALESCE((SELECT value FROM public.platform_settings WHERE key='vertical_id' LIMIT 1), 'MISSING')
UNION ALL
SELECT 'hazel admin user', CASE WHEN EXISTS (SELECT 1 FROM public.users WHERE lower(email)='hazelallurevibes@gmail.com' AND role='admin') THEN 'OK' ELSE 'MISSING' END;