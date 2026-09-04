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

## Booking

All booking CTAs open the Treatwell URL configured in Admin → Business → Treatwell.
