# FashionOps

A public lookbook of outfits sorted into aesthetic categories (coquette, grunge, goth, acubi, office siren…). Only the admin can upload, sort outfits and manage categories. Visitors can only browse.

**Stack:** Next.js 16 · TypeScript · Tailwind · Supabase (database, login, photo storage), all on free tiers.

## Status

- [x] **Phase 1:** single admin login, locked `/studio`, photo upload into the Inbox
- [x] **Phase 2:** category manager, 5 preset aesthetics
- [x] **Phase 3:** sorting outfits into genres (picking a genre publishes)
- [x] **Phase 4:** bespoke genre pages at `/coquette`, `/grunge`, `/goth`, `/acubi`, `/office-siren`
- [x] **Phase 5:** item tagging: pins on the photo, lines out to bubbles with shop / Instagram / local-store links
- [ ] Homepage genre picker

## Setup (one time)

### 1. Create a Supabase project
1. Sign up at [supabase.com](https://supabase.com) and create a new project (free plan).
2. Go to **Project Settings → API Keys** and copy the **Project URL** and the **publishable key**.
3. In this folder, copy the example env file and paste both values into `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

### 2. Create the database tables
Open **SQL Editor** in Supabase and run each file in `supabase/migrations/` **in order**: paste in the whole file and click **Run**.
1. `0001_phase1_admin_and_outfits.sql`: admin, outfits, photo storage
2. `0002_phase2_categories.sql`: categories, plus the 5 starter aesthetics
3. `0003_items.sql`: tagged items (pin position, name, shop link / Instagram handle / local store)

### 3. Create your admin account and turn off sign-ups
1. **Authentication → Users → Add user → Create new user**: enter your email and a strong password, and tick **Auto Confirm User**.
2. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up", so nobody else can create an account.
3. Make your account the admin by running this in the **SQL Editor** (use your own email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

### 4. Run the app
```bash
npm install
npm run dev
```
- Public site: http://localhost:3000
- Studio: http://localhost:3000/studio. It sends you to `/login` first.

## How access works
- Visitors never see a login link. `/studio` is only reachable by signing in at `/login`.
- Every studio page and server action calls `requireAdmin()` (`src/lib/auth.ts`).
- The database enforces the same rule: row-level security lets anyone **read published** outfits, but only accounts in `public.admins` can write.
- Photos are resized to 2000px and re-encoded in the browser before upload, which strips location data (EXIF/GPS).
