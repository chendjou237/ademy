-- Add Bunny.net specific fields to lessons table
-- This migration adds support for storing Bunny video metadata

-- Add bunny_video_id column to store the Bunny Stream video GUID
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS bunny_video_id TEXT;

-- Add bunny_library_id column to store the Bunny Stream library ID
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS bunny_library_id TEXT;

-- Add video_status column to track processing status
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS video_status TEXT CHECK (video_status IN ('queued', 'processing', 'encoding', 'finished', 'failed', 'unknown'));

-- Add thumbnail_url column for video thumbnails
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Create index for faster lookups by bunny_video_id
CREATE INDEX IF NOT EXISTS idx_lessons_bunny_video_id ON public.lessons(bunny_video_id);

-- Add comment to explain the video_url format
COMMENT ON COLUMN public.lessons.video_url IS 'Video URL - can be external URL or Bunny format: bunny://LIBRARY_ID/VIDEO_ID';

-- Update existing lessons to set default video_status
UPDATE public.lessons
SET video_status = 'finished'
WHERE video_url IS NOT NULL AND video_status IS NULL;
