ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS paystack_reference text,
  ADD COLUMN IF NOT EXISTS amount_kobo integer,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';