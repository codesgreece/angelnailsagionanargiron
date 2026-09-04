# Angel Nails

Production-ready website for **Angel Nails** nail & beauty salon in Άγιοι Ανάργυροι.

## Stack

- Next.js App Router
- PostgreSQL + Prisma
- Zod validation
- Secure admin auth (HTTP-only cookies, hashed passwords, rate limiting)
- Treatwell-only booking (no local reservations)

## Setup

```bash
cp .env.example .env
# edit DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Scripts

- `npm run dev` — local development
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm test`

## Admin

- URL: `/admin`
- Seed credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`

## Production (Vercel)

Project is linked and deployed to:

https://angelnailsagionanargiron.vercel.app

1. Create a PostgreSQL database (Neon / Vercel Postgres / Railway / etc.)
2. In Vercel → Project → Settings → Environment Variables set:
   - `DATABASE_URL`
   - `AUTH_SECRET` (long random string)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL` (your public domain)
3. Redeploy, then run against production DB:

```bash
DATABASE_URL="..." npx prisma migrate deploy
DATABASE_URL="..." npm run db:seed
```

Booking CTAs always open the Treatwell URL from Admin → Business → Treatwell.
