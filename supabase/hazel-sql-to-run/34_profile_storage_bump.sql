-- Hazel Allure — profile & vendor image storage (run if avatar uploads fail)
-- Bumps bucket size limits and ensures buckets + RLS exist

-- profile-avatars (seeker account photos + profile studio banners)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- vendor-assets (practitioner logo, highlight, banners)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-assets',
  'vendor-assets',
  true,
  6291456,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  DROP POLICY IF EXISTS "profile_avatars_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "profile_avatars_auth_upload" ON storage.objects;
  DROP POLICY IF EXISTS "profile_avatars_auth_update" ON storage.objects;
  DROP POLICY IF EXISTS "vendor_assets_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "vendor_assets_auth_upload" ON storage.objects;
  DROP POLICY IF EXISTS "vendor_assets_auth_update" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "profile_avatars_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-avatars');

CREATE POLICY "profile_avatars_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = public.current_user_email()
  );

CREATE POLICY "profile_avatars_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = public.current_user_email()
  );

CREATE POLICY "vendor_assets_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'vendor-assets');

CREATE POLICY "vendor_assets_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vendor-assets');

CREATE POLICY "vendor_assets_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'vendor-assets');