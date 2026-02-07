-- Create storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true) ON CONFLICT (id) DO NOTHING;
-- Set up storage policies for course thumbnails
-- Allow authenticated users to upload thumbnails
CREATE POLICY "Trainers can upload course thumbnails" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
      bucket_id = 'course-thumbnails'
      AND (storage.foldername(name)) [1] = 'thumbnails'
   );
-- Allow trainers to update their own thumbnails
CREATE POLICY "Trainers can update course thumbnails" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'course-thumbnails');
-- Allow trainers to delete their own thumbnails
CREATE POLICY "Trainers can delete course thumbnails" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'course-thumbnails');
-- Allow public read access to all thumbnails
CREATE POLICY "Anyone can view course thumbnails" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'course-thumbnails');
