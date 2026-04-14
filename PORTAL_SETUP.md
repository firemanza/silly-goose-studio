# Portal Setup

## Repo Shape

- Public site: repo root
- Admin portal: `apps/admin`
- Shared backend: Supabase

## Local Commands

```bash
npm run dev
npm run dev:admin
```

Public site runs on `http://localhost:3000`
Admin portal runs on `http://localhost:3001/login`

## Supabase

The project uses:
- `public.categories`
- `public.photos`
- `public.profiles`

Storage buckets:
- `photo-originals`
- `photo-display`
- `photo-thumbs`

## Vercel Deployment

Create two Vercel projects from the same repo.

### Public Site

- Root directory: `/`

Env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_NAME=...
NEXT_PUBLIC_TAGLINE=...
NEXT_PUBLIC_SITE_URL=...
NEXT_PUBLIC_INSTAGRAM_URL=...
NEXT_PUBLIC_CONTACT_EMAIL=...
NEXT_PUBLIC_LOCATION=...
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

### Admin Portal

- Root directory: `apps/admin`

Env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Remaining Manual Step

Create the two admin users in Supabase Auth and assign passwords:
- `scheepersstefan1@gmail.com`
- `markrimmerza@gmail.com`

The portal assumes both users are admins and can manage all photos.
