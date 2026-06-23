
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_reason text,
  ADD COLUMN IF NOT EXISTS verification_confidence numeric,
  ADD COLUMN IF NOT EXISTS verification_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_model text;

DO $$ BEGIN
  ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_verification_status_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_verification_status_check
  CHECK (verification_status IN ('pending', 'verified', 'suspicious', 'rejected', 'error'));

CREATE INDEX IF NOT EXISTS registrations_verification_status_idx
  ON public.registrations (verification_status);
