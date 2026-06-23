DROP POLICY IF EXISTS "Anyone can log pwa analytics" ON public.pwa_analytics;

CREATE POLICY "Anyone can log allowed pwa analytics events"
ON public.pwa_analytics
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IN (
    'app_install',
    'page_view',
    'route_change',
    'pwa_prompt',
    'pwa_accepted',
    'pwa_dismissed',
    'offline',
    'online',
    'error'
  )
  AND length(coalesce(event_type, '')) <= 64
  AND length(coalesce(path, '')) <= 512
  AND length(coalesce(session_id, '')) <= 128
  AND length(coalesce(user_agent, '')) <= 512
  AND length(coalesce(platform, '')) <= 64
);