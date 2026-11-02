-- Optional hardening: run this AFTER the admin has set up an authenticator
-- app at /admin/security. From then on, the database only accepts writes from
-- sessions that completed the second factor (aal2), so a stolen password alone
-- cannot change anything, even by calling the Supabase API directly.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  )
  and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2';
$$;
