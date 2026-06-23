
-- =========================
-- registrations
-- =========================
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attendee_type TEXT NOT NULL CHECK (attendee_type IN ('delegate','sponsor_rep','media','general')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL CHECK (phone ~ '^\+234[0-9]{10}$'),
  state TEXT NOT NULL CHECK (state IN (
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
    'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
    'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT'
  )),
  yali_id TEXT,
  track_selection TEXT CHECK (track_selection IN (
    'healthtech','agritech','edtech','govtech','fintech','climatetech','socialimpact'
  )),
  accommodation_needed BOOLEAN NOT NULL DEFAULT false,
  travel_support_needed BOOLEAN NOT NULL DEFAULT false,
  dietary_restrictions TEXT,
  heard_about_summit TEXT,
  ticket_code TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  email_confirmed BOOLEAN NOT NULL DEFAULT false,
  whatsapp_notified BOOLEAN NOT NULL DEFAULT false,
  calendar_downloaded BOOLEAN NOT NULL DEFAULT false,
  pwa_installed BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_registrations_ticket_code ON public.registrations(ticket_code);
CREATE INDEX idx_registrations_attendee_type ON public.registrations(attendee_type);

-- Enforce yali_id when attendee_type = 'delegate'
CREATE OR REPLACE FUNCTION public.enforce_delegate_yali_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.attendee_type = 'delegate' AND (NEW.yali_id IS NULL OR length(trim(NEW.yali_id)) = 0) THEN
    RAISE EXCEPTION 'yali_id is required when attendee_type is delegate';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_registrations_delegate_yali_id
BEFORE INSERT OR UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.enforce_delegate_yali_id();

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit registration"
  ON public.registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies => no public read/write access.

-- =========================
-- sponsor_inquiries
-- =========================
CREATE TABLE public.sponsor_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  budget_range TEXT NOT NULL CHECK (budget_range IN ('under_1m','1m_5m','5m_10m','10m_20m','above_20m')),
  preferred_tier TEXT NOT NULL CHECK (preferred_tier IN ('title','gold','silver','bronze','undecided')),
  goals TEXT NOT NULL,
  decision_timeline TEXT NOT NULL CHECK (decision_timeline IN ('within_1_week','within_2_weeks','within_1_month','flexible')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','meeting_scheduled','proposal_sent','closed')),
  assigned_to TEXT,
  notes TEXT
);

CREATE INDEX idx_sponsor_inquiries_status ON public.sponsor_inquiries(status);
CREATE INDEX idx_sponsor_inquiries_created_at ON public.sponsor_inquiries(created_at DESC);

ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit sponsor inquiry"
  ON public.sponsor_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =========================
-- contact_submissions
-- =========================
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =========================
-- stats (public counters)
-- =========================
CREATE TABLE public.stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stats are publicly readable"
  ON public.stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- No insert/update/delete policies => writes only via service role.

-- =========================
-- pwa_analytics
-- =========================
CREATE TABLE public.pwa_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'install_prompted','install_accepted','install_dismissed',
    'offline_view','push_subscribed','sw_activated'
  )),
  session_id TEXT,
  user_agent TEXT,
  platform TEXT,
  path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_pwa_analytics_event_type_created ON public.pwa_analytics(event_type, created_at DESC);

ALTER TABLE public.pwa_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log pwa analytics"
  ON public.pwa_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
