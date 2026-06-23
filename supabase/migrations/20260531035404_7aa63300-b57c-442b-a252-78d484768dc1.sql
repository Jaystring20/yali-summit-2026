-- Future-proof attendee_profiles for the YALI Network ecosystem
ALTER TABLE public.attendee_profiles
  ADD COLUMN IF NOT EXISTS home_state text,
  ADD COLUMN IF NOT EXISTS hub_affiliations text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS linkedin_sub text,
  ADD COLUMN IF NOT EXISTS sectors text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_active_member boolean NOT NULL DEFAULT true;

-- Extend role enum for future hub admins (no UI yet)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'hub_admin'
      AND enumtypid = 'public.app_role'::regtype
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'hub_admin';
  END IF;
END$$;