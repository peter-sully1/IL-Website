-- Bait al-Elmi: articles, single-admin access, and image storage.
-- Run in the Supabase SQL editor, or with `supabase db push`.

-- ---------------------------------------------------------------------------
-- Admins
-- Only user ids in this table can write. Sign-ups are disabled in Supabase
-- Auth, and the admin account is created by hand, so this holds one row.
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- No policies: the table is invisible to the anon and authenticated roles.
-- Membership is checked through the security-definer function below.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 1 and 200),
  excerpt text check (char_length(excerpt) <= 400),
  content_json jsonb not null,
  content_html text not null,
  cover_image_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_has_date check (status = 'draft' or published_at is not null)
);

create index articles_published_idx
  on public.articles (published_at desc)
  where status = 'published';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

alter table public.articles enable row level security;

create policy "Anyone can read published articles"
  on public.articles for select
  to anon, authenticated
  using (status = 'published');

create policy "Admin can read all articles"
  on public.articles for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin can insert articles"
  on public.articles for insert
  to authenticated
  with check ((select public.is_admin()) and author_id = (select auth.uid()));

create policy "Admin can update articles"
  on public.articles for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admin can delete articles"
  on public.articles for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Image storage
-- Public bucket: anyone can view images by URL. Only the admin can upload,
-- replace or delete. The bucket itself enforces size and type limits.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-images', 'article-images', true, 5242880, array['image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admin can upload article images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'article-images' and (select public.is_admin()));

create policy "Admin can update article images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'article-images' and (select public.is_admin()));

create policy "Admin can delete article images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'article-images' and (select public.is_admin()));
