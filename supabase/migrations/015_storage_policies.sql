-- Migration 015: Storage bucket RLS policies for avatars and barn-media

-- Public read for both buckets
CREATE POLICY "Public read for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public read for barn-media" ON storage.objects FOR SELECT USING (bucket_id = 'barn-media');

-- Authenticated users can upload to their own folder in avatars
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update/delete their own avatars
CREATE POLICY "Users can manage own avatars" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users can upload to barn-media (farm-level access checked at app level)
CREATE POLICY "Authenticated users can upload barn media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'barn-media' AND auth.role() = 'authenticated'
);

-- Users can update/delete barn media they uploaded (their userId is first path segment)
CREATE POLICY "Users can update own barn media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'barn-media' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can delete own barn media" ON storage.objects FOR DELETE USING (
  bucket_id = 'barn-media' AND auth.role() = 'authenticated'
);
