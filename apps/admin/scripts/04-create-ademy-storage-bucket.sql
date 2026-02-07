-- Create 'ademy' storage bucket for course thumbnails and other assets
-- This bucket is used by the image upload component

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ademy', 'ademy', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload to ademy bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update in ademy bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from ademy bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can view ademy bucket files" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to ademy bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ademy'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update in ademy bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'ademy');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete from ademy bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ademy');

-- Allow public read access to all files (for course thumbnails, etc.)
CREATE POLICY "Public can view ademy bucket files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ademy');
