# صناعة حمص Implementation Plan

## Summary
Build the existing empty Next `16.2.4` App Router project into a production-ready Arabic RTL local industrial marketplace. No code will be written until approval. The implementation will follow the local Next docs already inspected: use `proxy.ts` instead of deprecated `middleware.ts`, Server Components by default, async `params/searchParams`, and `next/image` with `preload`/`fetchPriority` instead of deprecated `priority`.

## 1. Recommended File And Folder Structure
```txt
app/
  layout.tsx
  globals.css
  proxy.ts
  (site)/page.tsx
  (site)/categories/page.tsx
  (site)/categories/[slug]/page.tsx
  (site)/businesses/[slug]/page.tsx
  (site)/add-business/page.tsx
  (site)/favorites/page.tsx
  (site)/search/page.tsx
  (auth)/login/page.tsx
  (auth)/register/page.tsx
  admin/layout.tsx
  admin/page.tsx
  admin/businesses/page.tsx
  admin/categories/page.tsx
  admin/subcategories/page.tsx
  admin/ads/page.tsx
  admin/users/page.tsx
  api/search-suggestions/route.ts
components/
  layout, home, business, forms, admin, ui
actions/
  auth.ts, businesses.ts, reviews.ts, favorites.ts, admin.ts
lib/
  supabase/client.ts, supabase/server.ts, supabase/admin.ts, supabase/proxy.ts
  data/*.ts, validation/*.ts, utils.ts, constants.ts
types/
  database.ts, app.ts
hooks/
  use-debounced-value.ts, use-geolocation.ts
supabase/
  migrations/0001_schema.sql
  migrations/0002_functions_triggers_indexes.sql
  migrations/0003_rls_policies.sql
  migrations/0004_storage.sql
  migrations/0005_seed.sql
public/
  images/fallbacks/*
```

Required packages to add later: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`.

## 2. Supabase Database Schema Order
1. Enable extensions: `pgcrypto`; optional `citext` for case-insensitive username handling.
2. Core identity and taxonomy: `profiles`, `categories`, `subcategories`.
3. Marketplace entities: `businesses`, `business_images`, `business_services`, `business_products`.
4. User interactions: `reviews`, `favorites`.
5. Monetization: `ads`.
6. Safe public helpers/views: `public_profiles` view exposing only `id`, `full_name`, `avatar_url`.
7. Indexes: category/status/date/rating/name/location plus unique constraints for `username`, `phone`, slugs, and one review/favorite per user-business pair.
8. Functions/triggers: profile creation from Auth metadata, `updated_at`, rating recalculation on review insert/update/delete, admin helper functions, search RPC.
9. RLS policies.
10. Storage buckets and storage object policies.
11. Arabic seed data.

## 3. RLS Policy Strategy
Enable RLS on all public tables. Use SQL helper functions such as `is_admin()` and `owns_business(business_id)` with locked `search_path`.

Public/anonymous users may read only:
- approved businesses and related images/services/products
- active ads within `start_date <= current_date AND end_date >= current_date`
- categories/subcategories
- approved reviews and safe public profile display fields

Authenticated users may:
- manage their own profile except `role`
- submit businesses as `pending`
- edit their own allowed business fields through server actions; owner edits reset the business to `pending`
- create/update/delete their own review, one per business
- create/delete/view their own favorites

Admins may manage all tables, approve/reject businesses, feature businesses, manage ads/categories/subcategories/users, and perform server-only Auth admin actions.

## 4. Auth Strategy
Use Supabase Auth for passwords. Registration will use phone + password, with `full_name`, `username`, and `phone` mirrored into `profiles` via metadata and a DB trigger.

Login will accept phone or username:
- phone input: normalize Syrian numbers to E.164, defaulting local `09...` to `+9639...`
- username input: server-only lookup resolves exact username to phone, then calls Supabase `signInWithPassword`
- all login errors stay generic to reduce account enumeration

Use `@supabase/ssr` clients:
- browser client for interactive client components
- server client for Server Components, Server Actions, and Route Handlers
- server-only admin client only where required, never client-importable
- `proxy.ts` refreshes auth cookies
- protected routes also verify session and role server-side, not only in navigation UI

## 5. Page-By-Page Implementation Plan
Home `/`:
- Dark navy header, RTL nav, orange active underline, auth/user dropdown.
- Hero uses industrial grinder/sparks image with dark overlay, Arabic headline, clean search bar, location selector, orange search button, and side ad card.
- Ads slider loads active `home_slider` ads sorted by priority.
- Categories load from DB with screenshot-like white bordered icon cards.
- Latest businesses: approved only, created desc, limit 10.
- Top rated businesses: approved only, rating desc then reviews count desc.

Categories `/categories`:
- Grid of all categories with search-style intro and clean card layout.

Category details `/categories/[slug]`:
- Resolve category by slug.
- Show approved businesses only.
- Filters: area, rating, subcategory.
- Sorting: top rated, newest, nearest when coordinates exist.
- Paginated business cards.

Business details `/businesses/[slug]`:
- Approved public view, owner/admin can view own pending via server authorization.
- Cover, logo, name, rating, reviews count, share, featured badge.
- Info, services, products, contact, WhatsApp/call, map iframe from lat/lng.
- Gallery with `next/image`.
- Reviews list and authenticated review form with edit existing review.
- Mobile sticky contact bar.

Add business `/add-business`:
- Auth required.
- Zod-validated form with uploads to Supabase Storage.
- Insert business as `pending`, related services/products/images after business insert.
- Success message: `تم إرسال طلب إضافة المحل بنجاح، سيتم مراجعته من قبل الإدارة`.

Auth `/login`, `/register`:
- Arabic forms, phone/username login, phone normalization, `useActionState`, server validation.

Favorites `/favorites`:
- Auth required.
- Shows only current user favorites with remove actions.

Search `/search?q=...`:
- Uses ILIKE-based RPC/search data function across name, category, location, services, products.
- Live suggestions via route handler.
- Filters for category/location/rating and optional price UI only if products have prices.

## 6. Component List
Layout: `Header`, `UserMenu`, `MobileBottomNav`, `Footer`.

Home: `HeroSearch`, `HeroAdCard`, `AdsSlider`, `CategoryCard`, `LatestBusinesses`, `TopRatedList`.

Business: `BusinessCard`, `BusinessHeader`, `BusinessGallery`, `RatingStars`, `ReviewForm`, `FavoriteButton`, `WhatsAppButton`, `CallButton`, `StickyContactBar`.

Search/forms: `SearchFilters`, `Pagination`, `UploadImageField`, `SubmitButton`, `EmptyState`, `LoadingSkeleton`.

Admin: `AdminSidebar`, `AdminHeader`, `AdminStatsCards`, `AdminTable`, `StatusBadge`, `AdminBusinessForm`, `AdminAdForm`, `AdminCategoryForm`.

## 7. Admin Panel Structure
`/admin` dashboard:
- total users, businesses, pending businesses, reviews, active ads.

`/admin/businesses`:
- table with status/category/search filters
- approve, reject, edit, delete, feature/unfeature

`/admin/categories` and `/admin/subcategories`:
- create/edit/delete, image/icon upload, sort order

`/admin/ads`:
- create/edit/delete ads
- ad type: `home_slider`, `featured_business`, `category_ad`
- priority/date/activity controls
- link to business/category or URL

`/admin/users`:
- view users
- change role
- disable/delete only through server-only admin action where Supabase credentials allow it

Admin pages use a separate layout with sidebar and strict server-side role checks.

## 8. Styling And Theme Plan
Root layout: `lang="ar"`, `dir="rtl"`, Arabic font such as Cairo/Tajawal with system fallback.

Theme:
- dark header/hero: `#071018` / `#0b1117`
- primary orange: `#f97316` / `#ff8500`
- page background: `#f5f5f5`
- cards: `#ffffff`
- borders: `#e5e7eb`
- muted text: `#6b7280`

Visual rules:
- no neon, no glassmorphism, no blobs, no purple/blue SaaS gradients
- white cards, light borders, subtle shadows, 8px-ish radius
- practical marketplace density like the screenshot
- desktop home mirrors screenshot: hero, ad banners, category row, latest grid with top-rated side panel
- mobile uses compact stacked sections and bottom nav

## 9. Potential Issues Or Missing Details
- `.env.local` must define `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `SUPABASE_SERVICE_ROLE_KEY` is optional and server-only for privileged admin user management.
- Phone/password auth requires enabling Phone Auth in Supabase; SMS verification requires a configured provider such as Twilio, MessageBird, or Vonage.
- Username login is handled server-side by resolving username to phone through `resolve_login_phone`, returning generic errors, and applying a lightweight rate limit.
- Exact production images are not provided beyond the screenshot; use uploaded Supabase images and the industrial fallback assets in `public/images`.
- Google Maps embed works with stored latitude/longitude without an API key; advanced Maps Platform features need `GOOGLE_MAPS_API_KEY`.
- Paid ad billing is not included; admins manually manage paid ad records, dates, and priority.
- Do not display “مفتوح الآن” unless real business-hours rows are available for that business.
- “قريب مني” depends on browser geolocation permission and valid business coordinates.

## 10. Step-By-Step Build Phases
1. Database first: write migrations for schema, constraints, indexes, functions, triggers, RLS, storage, and seed data.
2. Supabase setup: add clients, env comments, proxy auth refresh, server-only role helpers.
3. App shell/theme: RTL root layout, Tailwind theme, header, mobile bottom nav, base UI components.
4. Homepage: hero, search, ads slider, categories, latest businesses, top-rated panel.
5. Public marketplace pages: categories, category details, business details, search and suggestions.
6. Auth: register/login/logout, profile trigger verification, protected redirects.
7. Business submission: Zod forms, image uploads, pending workflow.
8. Reviews/favorites: unique review handling, rating trigger verification, favorites page/buttons.
9. Admin panel: dashboard, CRUD screens, approval and ad/category/user management.
10. Polish/testing: loading/empty/error states, mobile pass, accessibility, lint/build, RLS smoke tests.

## Test Plan
- Run `npm run lint` and `npm run build`.
- Use `docs/RLS_SMOKE_TESTS.sql` after applying migrations to a Supabase project for database-level smoke checks.
- Verify anonymous users only see approved businesses and active date-valid ads.
- Verify registered users can submit pending businesses, favorite businesses, and review each business once.
- Verify review insert/update/delete recalculates rating average and count.
- Verify owners cannot approve, feature, or alter protected admin fields.
- Verify admins can approve/reject/edit/delete and manage categories/subcategories/ads/users.
- Verify mobile layout: bottom nav, sticky contact bar, no overflow/overlap.
- Verify Supabase Storage upload/read policies for each bucket.

## References Used
- Local Next `16.2.4` docs in `node_modules/next/dist/docs/`
- Supabase SSR client docs: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase password/phone auth: https://supabase.com/docs/guides/auth/passwords
