GRANT INSERT ON public.registrations TO anon, authenticated;
GRANT ALL ON public.registrations TO service_role;

GRANT INSERT ON public.sponsor_inquiries TO anon, authenticated;
GRANT ALL ON public.sponsor_inquiries TO service_role;

GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT ALL ON public.contact_submissions TO service_role;

CREATE OR REPLACE FUNCTION public.get_public_registration_confirmation(registration_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_jsonb(r)
  FROM (
    SELECT
      id,
      full_name,
      email,
      ticket_code,
      track_selection,
      attendee_type,
      created_at,
      payment_status,
      amount_kobo
    FROM public.registrations
    WHERE id = registration_id
  ) r;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_registration_confirmation(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_public_ticket_by_code(ticket_code_input text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_jsonb(r)
  FROM (
    SELECT
      id,
      ticket_code,
      full_name,
      attendee_type,
      track_selection,
      verification_status,
      checked_in_at,
      created_at
    FROM public.registrations
    WHERE ticket_code = ticket_code_input
  ) r;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_ticket_by_code(text) TO anon, authenticated, service_role;