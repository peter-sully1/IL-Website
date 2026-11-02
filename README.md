# Bait al-Elmi Learning Centre

Website for a community Islamic learning centre, with a private admin area where the centre's owner writes and publishes articles herself.

**Stack:** Next.js 16 (App Router, Server Actions, ISR) · Supabase (Postgres, Auth, Storage) · Tiptap editor · TypeScript · Vercel

## How it works

```
Public (static, cached)                 Admin (dynamic, signed in)
──────────────────────                  ──────────────────────────
/  /about  /events  /shop               /login → /login/mfa (if enabled)
/articles        ← ISR, anon client     /admin                 article list
/articles/[slug] ← ISR, anon client     /admin/articles/new    Tiptap editor
        ▲                               /admin/articles/[id]/edit
        │ revalidatePath()              /admin/security        authenticator app setup
        └────────── Server Actions ─────────┘
                    │  (run as the signed-in user)
                    ▼
            Supabase Postgres + Storage
            row-level security decides every read and write
```

- Public pages never read cookies, so they are pre-rendered and served from the CDN. They query Supabase as the `anon` role, which row-level security limits to published articles.
- When an article is published, edited or deleted, the Server Action calls `revalidatePath`, so the change appears within seconds. A 1-hour revalidation is the fallback.
- The admin area runs every query as the signed-in user, so the database's policies apply to the admin too.

## Security design

Authorisation is enforced in three independent layers, so a mistake in one doesn't open the site:

| Layer | Where | What it does |
|---|---|---|
| Proxy | `proxy.ts` | Refreshes the session and redirects signed-out visitors away from `/admin`. Convenience only; never relied on. |
| App | `lib/auth.ts` → `requireAdmin()` | Called by **every** admin page and Server Action. Verifies the session with Supabase, checks the user is `ADMIN_USER_ID`, and requires the second factor if one is set up. |
| Database | `supabase/migrations/0001_init.sql` | Row-level security: anyone can read published articles; only users in `admins` can write. Storage policies do the same for images. |

The proxy is deliberately not the security boundary. Next.js middleware has had bypass vulnerabilities (CVE-2025-29927), so checks live where the data is used.

Other measures:

- **No public sign-up.** Sign-ups are disabled in Supabase; the single admin account is created by hand.
- **Optional authenticator app (TOTP).** Set up at `/admin/security`. `supabase/optional/require-mfa.sql` then makes the database itself reject writes from sessions that haven't passed the code check.
- **Article HTML is sanitised twice**, on save and on render, with an allow-list (`lib/sanitize.ts`). Scripts, event handlers, styles, iframes and images from other domains are removed; links get `rel="noopener noreferrer nofollow"`.
- **Uploads are checked by content, not file name.** `sharp` decodes the file, rejects anything that isn't a real JPEG/PNG/WebP/GIF/HEIF/AVIF, caps its pixel count, applies orientation, strips metadata (including GPS), resizes, and re-encodes to WebP. The storage bucket only accepts WebP up to 5 MB.
- **Input validation** with Zod on every Server Action.
- **Generic login errors** so the form doesn't reveal whether an email exists. Supabase rate-limits sign-in attempts.
- **Security headers** in `next.config.ts`: CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies.
- **The service-role key is never used.** The app only holds the public anon key; everything privileged goes through row-level security.

**CSP trade-off:** a nonce-based CSP would make every page render dynamically and lose static generation. This site uses `script-src 'self' 'unsafe-inline'` instead, which still blocks third-party scripts. Because article HTML is sanitised against an allow-list, injected inline scripts can't get into a page in the first place.

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Sign In / Providers:** turn off **Allow new users to sign up**. Keep Email enabled.
3. **Authentication → Users → Add user:** create the admin with her email and a strong password. Tick *Auto confirm*. Copy the user's **UID**.
4. **SQL Editor:** run `supabase/migrations/0001_init.sql`, then add her to the admin list:

   ```sql
   insert into public.admins (user_id) values ('<her-user-id>');
   ```

5. **Project Settings → API:** copy the project URL and the anon (publishable) key.

### 2. Local development

```bash
cp .env.example .env.local   # fill in the URL, anon key and ADMIN_USER_ID
npm install
npm run dev
```

Open <http://localhost:3000/login>.

### 3. Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Add the four variables from `.env.example` in Project Settings → Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to the live URL.
3. In Supabase **Authentication → URL Configuration**, set the Site URL to the live URL.

### 4. Turn on the authenticator app (recommended)

1. Sign in as the admin and open **Sign-in security**. Scan the QR code with Google Authenticator or Microsoft Authenticator and enter the code.
2. Optionally run `supabase/optional/require-mfa.sql` so the database also requires it.

### 5. Backups

`.github/workflows/backup.yml` dumps the database weekly and keeps it as a GitHub Actions artifact for 90 days. Add a repository secret `SUPABASE_DB_URL` with the connection string from Supabase → Connect (use the session pooler string). Run it once by hand from the Actions tab to check it works.

The dump includes article text and the image file *list*, not the image files themselves. To back those up too, copy the `article-images` bucket periodically with the Supabase CLI's storage commands or the S3-compatible storage endpoint.

## Maintenance

- **Dependabot** (`.github/dependabot.yml`) opens weekly PRs for dependency updates. Patch Next.js and Supabase promptly.
- **Free-tier pausing:** check Supabase's current policy on pausing inactive free projects. Regular site traffic usually keeps it active.
- **Deleted articles** remove their cover image. Images inserted inside the article body are left in storage; clean them up occasionally from the Supabase dashboard if space matters.

## Project structure

```
app/
  (site)/             public pages with the site header and footer
    articles/         article list and article pages (ISR)
  login/              sign-in, authenticator code, sign-out actions
  admin/              dashboard, editor, security settings, Server Actions
components/           Editor (Tiptap), ArticleForm, navigation
lib/
  auth.ts             requireAdmin(): the single gate for admin code
  sanitize.ts         HTML allow-list
  validation.ts       Zod schemas
  supabase/           server (cookie), public (anon) and browser clients
proxy.ts              session refresh and /admin redirect
supabase/
  migrations/         schema, row-level security, storage policies
  optional/           database-level MFA requirement
```
