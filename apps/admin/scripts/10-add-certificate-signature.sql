-- Add signature fields for certificates
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS certificate_signature_name TEXT;

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS certificate_signature_title TEXT;
