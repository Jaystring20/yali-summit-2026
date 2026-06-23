create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  is_staff boolean;
  result jsonb;
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  is_staff := public.has_role(uid, 'admin'::app_role) or public.has_role(uid, 'staff'::app_role);
  if not is_staff then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  with
    totals as (
      select
        count(*)::int as total,
        count(*) filter (where payment_status = 'paid')::int as paid,
        count(*) filter (where payment_status = 'pending')::int as pending_payment,
        count(*) filter (where verification_status = 'verified')::int as verified,
        count(*) filter (where checked_in_at is not null)::int as checked_in,
        count(*) filter (where created_at >= now() - interval '24 hours')::int as last_24h,
        coalesce(sum(amount_kobo) filter (where payment_status = 'paid'), 0)::bigint as revenue_kobo
      from public.registrations
    ),
    by_type as (
      select coalesce(attendee_type, 'unknown') as key, count(*)::int as count
      from public.registrations group by 1 order by 2 desc
    ),
    by_verification as (
      select coalesce(verification_status, 'unknown') as key, count(*)::int as count
      from public.registrations group by 1 order by 2 desc
    ),
    by_payment as (
      select coalesce(payment_status, 'unknown') as key, count(*)::int as count
      from public.registrations group by 1 order by 2 desc
    ),
    by_track as (
      select coalesce(track_selection, 'unassigned') as key, count(*)::int as count
      from public.registrations group by 1 order by 2 desc
    ),
    by_state as (
      select coalesce(state, 'unknown') as key, count(*)::int as count
      from public.registrations group by 1 order by 2 desc limit 15
    ),
    days as (
      select (date_trunc('day', now()) - (n || ' days')::interval)::date as day
      from generate_series(0, 29) as n
    ),
    daily_counts as (
      select date_trunc('day', created_at)::date as day, count(*)::int as count
      from public.registrations
      where created_at >= now() - interval '30 days'
      group by 1
    ),
    trend as (
      select to_char(d.day, 'YYYY-MM-DD') as date, coalesce(c.count, 0) as count
      from days d left join daily_counts c on c.day = d.day
      order by d.day asc
    ),
    recent as (
      select id, full_name, email, attendee_type, verification_status, payment_status, ticket_code, created_at
      from public.registrations
      order by created_at desc
      limit 10
    )
  select jsonb_build_object(
    'totals', (select to_jsonb(t) from totals t),
    'byAttendeeType', coalesce((select jsonb_agg(to_jsonb(b)) from by_type b), '[]'::jsonb),
    'byVerification', coalesce((select jsonb_agg(to_jsonb(b)) from by_verification b), '[]'::jsonb),
    'byPayment', coalesce((select jsonb_agg(to_jsonb(b)) from by_payment b), '[]'::jsonb),
    'byTrack', coalesce((select jsonb_agg(to_jsonb(b)) from by_track b), '[]'::jsonb),
    'byState', coalesce((select jsonb_agg(to_jsonb(b)) from by_state b), '[]'::jsonb),
    'trend30d', coalesce((select jsonb_agg(to_jsonb(t)) from trend t), '[]'::jsonb),
    'recent', coalesce((select jsonb_agg(to_jsonb(r)) from recent r), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

revoke all on function public.admin_dashboard_stats() from public;
grant execute on function public.admin_dashboard_stats() to authenticated;
grant execute on function public.admin_dashboard_stats() to service_role;