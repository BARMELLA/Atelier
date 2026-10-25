# Atelier — deployable web app starter

Atelier is a mobile-first wardrobe and styling app built with Next.js App Router, TypeScript, and Supabase.

## Included
- Email/password authentication through Supabase
- Private wardrobe item CRUD, photo uploads to Supabase Storage
- Outfit creation, editing, favorites, wear history, and wishlist
- Weather/occasion/aesthetic filters in the UI
- PWA manifest and service worker for installability
- Server-side API route placeholder for secure AI requests
- SQL schema with row-level security

## You need to configure
1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Create a public storage bucket named `wardrobe-images` (or make it private and adapt the signed-URL helper).
4. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key.
5. Install and run:
   ```bash
   npm install
   npm run dev
   ```
6. Deploy the repository to a host such as Vercel. Add the same environment variables to the host.
7. For AI tagging/outfit suggestions, add `OPENAI_API_KEY` server-side and implement the route in `app/api/ai/route.ts`. Never expose the key in `NEXT_PUBLIC_*`.

## Important scope note
This is a functional starter foundation, not a deployed public website. Publishing requires a hosting account and your own Supabase project credentials. Model previews / virtual try-on require a separate image-generation or try-on provider and API credentials. The included outfit generator creates combinations from saved wardrobe records; it does not claim to render photorealistic try-on images.

## PWA
The app includes a web manifest and a minimal service worker. For iOS, open the deployed URL in Safari and choose Share → Add to Home Screen. HTTPS is required for service-worker installation.


## Existing wardrobe references
The `public/wardrobe-references/` directory includes eight saved wardrobe lookbooks/reference boards found in the user's Library. `public/wardrobe-seed.json` contains an expanded starter catalog assembled from prior inventory notes and lookbooks. It intentionally marks entries as `needs_confirmation`; some entries are reference-only candidates, and the app must not treat them as verified ownership until the user confirms them. The reference boards are collages, not individual garment photos.
