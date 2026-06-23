
-- 1. Tighten the yali-certificates bucket itself
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf','image/png','image/jpeg']
WHERE id = 'yali-certificates';

-- 2. Replace permissive upload policy with one that constrains filename shape
DROP POLICY IF EXISTS "Anyone can upload YALI certificate" ON storage.objects;

CREATE POLICY "Constrained YALI certificate upload"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'yali-certificates'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|png|jpg|jpeg)$'
);

-- 3. Let admins and staff read certificates for verification
CREATE POLICY "Admins and staff can read YALI certificates"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'yali-certificates'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'staff'::public.app_role))
);

-- 4. Let admins remove certificates
CREATE POLICY "Admins can delete YALI certificates"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'yali-certificates'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 5. Trigger function is internal — revoke direct API execution
REVOKE EXECUTE ON FUNCTION public.enforce_delegate_yali_id() FROM PUBLIC, anon, authenticated;
