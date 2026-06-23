
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS yali_certificate_url text;

-- Update the delegate enforcement trigger to also require certificate
CREATE OR REPLACE FUNCTION public.enforce_delegate_yali_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.attendee_type = 'delegate' THEN
    IF NEW.yali_id IS NULL OR length(trim(NEW.yali_id)) = 0 THEN
      RAISE EXCEPTION 'yali_id is required when attendee_type is delegate';
    END IF;
    IF NEW.yali_certificate_url IS NULL OR length(trim(NEW.yali_certificate_url)) = 0 THEN
      RAISE EXCEPTION 'yali_certificate_url is required when attendee_type is delegate';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create private storage bucket for YALI membership certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('yali-certificates', 'yali-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone (anon, authenticated) to upload certificates during registration
CREATE POLICY "Anyone can upload YALI certificate"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'yali-certificates');
