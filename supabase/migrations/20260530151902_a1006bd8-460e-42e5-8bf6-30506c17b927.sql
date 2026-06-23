
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS role_title text,
  ADD COLUMN IF NOT EXISTS sponsor_tier text,
  ADD COLUMN IF NOT EXISTS sponsor_goals text,
  ADD COLUMN IF NOT EXISTS media_outlet text,
  ADD COLUMN IF NOT EXISTS media_type text,
  ADD COLUMN IF NOT EXISTS media_coverage_focus text,
  ADD COLUMN IF NOT EXISTS audience_reach text,
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS reason_for_attending text,
  ADD COLUMN IF NOT EXISTS volunteer_skills text,
  ADD COLUMN IF NOT EXISTS volunteer_availability text,
  ADD COLUMN IF NOT EXISTS tshirt_size text,
  ADD COLUMN IF NOT EXISTS prior_volunteer_experience text;

-- Update validation trigger to enforce type-specific required fields
CREATE OR REPLACE FUNCTION public.enforce_delegate_yali_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.attendee_type = 'delegate' THEN
    IF NEW.yali_id IS NULL OR length(trim(NEW.yali_id)) = 0 THEN
      RAISE EXCEPTION 'yali_id is required when attendee_type is delegate';
    END IF;
    IF NEW.yali_certificate_url IS NULL OR length(trim(NEW.yali_certificate_url)) = 0 THEN
      RAISE EXCEPTION 'yali_certificate_url is required when attendee_type is delegate';
    END IF;
  ELSIF NEW.attendee_type = 'sponsor' THEN
    IF NEW.organization IS NULL OR length(trim(NEW.organization)) = 0 THEN
      RAISE EXCEPTION 'organization is required for sponsor representatives';
    END IF;
    IF NEW.role_title IS NULL OR length(trim(NEW.role_title)) = 0 THEN
      RAISE EXCEPTION 'role_title is required for sponsor representatives';
    END IF;
  ELSIF NEW.attendee_type = 'media' THEN
    IF NEW.media_outlet IS NULL OR length(trim(NEW.media_outlet)) = 0 THEN
      RAISE EXCEPTION 'media_outlet is required for media attendees';
    END IF;
    IF NEW.media_type IS NULL OR length(trim(NEW.media_type)) = 0 THEN
      RAISE EXCEPTION 'media_type is required for media attendees';
    END IF;
  ELSIF NEW.attendee_type = 'volunteer' THEN
    IF NEW.volunteer_skills IS NULL OR length(trim(NEW.volunteer_skills)) = 0 THEN
      RAISE EXCEPTION 'volunteer_skills is required for volunteers';
    END IF;
    IF NEW.volunteer_availability IS NULL OR length(trim(NEW.volunteer_availability)) = 0 THEN
      RAISE EXCEPTION 'volunteer_availability is required for volunteers';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
