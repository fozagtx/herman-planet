# Behind the Hook · Herman Suede

A track-first home for Herman Suede. A listener lands on a song, hears it, opens the story behind specific moments (sound, lyrics, production, credits), goes to the official release, and leaves their city so Herman's team knows where fans are.

Live: https://herman-planet.vercel.app

| Route | Who it's for | What it does |
|---|---|---|
| `/` | Listeners | Herman's site: latest release, every release with previews, lines from the song, video, sign-up with city |
| `/t/she-get` | Listeners | The track page: the real song via Spotify, timed moments, credits, more releases, follow |
| `/t/she-get/m/42` | Shared links | Same page, opened on a marked moment (here 0:42) with a matching share image |
| `/studio` | Herman's team | Write timed notes, send for review, approve, unpublish |
| `/team` | Herman's team, promoters | Followers by city, who would buy a ticket, which moment brought them in, CSV export |

## How it answers the brief

| Brief | Where |
|---|---|
| 01 Hear it: a fan arrives through a shared song or clip | Moment links (`/t/[slug]/m/[seconds]`) open on that second, each with its own preview card |
| 02 Explore: approved preview with timed notes, with credits | Markers on the timeline and a moment list; each note has a body, credits and its source |
| 03 Listen in full: official release, related tracks | Spotify, Apple Music and YouTube links, plus "More from Herman" covers linking to each release |
| 04 Come back: future releases, approved live update | Follow form (email or phone, city, "I'd buy a ticket", consent); a live update card appears only when one is approved |
| Demo: jump to a marked moment, open the production note, move to the official release | Open `/t/she-get/m/20`, press Play, read the note, press Spotify |
| Artist-approved notes | Fans only ever load notes with `status = approved` (enforced in the query, `src/lib/store.ts`) |
| Cleared media | The song plays through Spotify's official embed; previews and artwork are Apple's official assets |
| Working links | Every outbound link was checked to return 200 on 27 Nov 2026 |
| City-by-city demand vs direct updates | Both in one form: the follow carries a city, so updates and demand come from the same sign-up |

## What is real and what is not

Real:
- The song "She Get" (released 25 Nov 2026). It plays through the Spotify embed. Signed in to Spotify, a listener hears the full song and can jump to any moment. Signed out, Spotify plays its own 30 second preview and the page says so.
- Release covers and 30 second previews from Apple (iTunes Lookup API), credits as reported at release (MILN, BNYX®, realsmart), the One by One video, and the streaming and social links.
- Followers and notes are stored in Neon Postgres.

Not yet from Herman's team:
- The note text is drawn from published coverage of the single. Each note shows "From the release coverage" instead of an approval badge. Once the team rewrites and approves a note in `/studio`, it shows "Approved by Herman's team".
- Note timestamps are estimates. The team sets the real seconds in `/studio`.
- There are no show dates, so the page says "No dates yet" and asks for a city.
- `/studio` and `/team` have no sign-in. Add auth before giving the URL to anyone outside the team.

## Stack

- Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4
- Neon Postgres with Drizzle ORM (`src/db`)
- Spotify Embed iFrame API for playback (`src/components/use-spotify-player.ts`)
- Web Audio stem player for tracks that come with cleared stems (`src/components/use-stem-player.ts`)
- UI: the Paper & Ink system (warm paper, violet-black ink, colour only where it means something) and VengeanceUI components: Magnetic Spotlight Marquee, Diagonal Carousel, Music Player, Verse Cards, Aurora Hero, Awwwards Nav, Candy Button

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in your Neon connection strings
npm run db:migrate           # create tables
npm run db:seed              # add She Get and its notes (safe to re-run)
npm run dev
```

`.env.local`:

```
DATABASE_URL='postgresql://…-pooler…/neondb?sslmode=verify-full'
DATABASE_URL_UNPOOLED='postgresql://…/neondb?sslmode=verify-full'
NEXT_PUBLIC_SITE_URL='http://localhost:3000'   # absolute URLs for share images
```

Health check: `GET /api/health` returns `{"status":"ok","database":"connected"}`.

## Data model

`src/db/schema.ts`

- `tracks`: slug, title, artist, duration, hook second, Spotify track id, artwork, preview, credits, release links, related tracks, optional approved live update, optional stems.
- `notes`: track, second (`t`), kind (`sound`, `lyrics`, `production`), title, body, credits, optional stem layers to solo, `status` (`draft`, `in_review`, `approved`), who approved and when.
- `follows`: track, the moment the fan was on, contact, city, ticket intent, consent, time.

Rules:
- Fans see `approved` notes only.
- Editing an approved note sends it back to `in_review`, because approval covers the exact words.
- The CSV export leaves out contacts: promoters get demand, not people's details.

## Adding a track

1. Add a row to `tracks` (or extend `src/lib/seed.ts` and run `npm run db:seed`) with the Spotify track id, artwork and release links.
2. Write notes in `/studio` and approve them.
3. Share `/t/<slug>/m/<seconds>` links.

For a track with cleared stems, leave `spotify_track_id` empty and fill `stems`; the page switches to the stem player and notes with `layers` get a "Hear this layer alone" button.

## Project layout

```
src/app/page.tsx                 landing
src/app/t/[slug]/...             track page, moment links, share image
src/app/studio/page.tsx          note approval
src/app/team/...                 demand view and CSV export
src/app/actions.ts               follow, note status, note save (server actions)
src/components/track-experience.tsx   track page UI and follow form
src/components/landing/*         landing sections
src/lib/store.ts                 all database reads and writes
src/lib/catalogue.ts             Herman's releases (Apple artwork and previews)
src/db/*                         schema, migrations, seed
```

## Deploy

The repo is connected to Vercel (`herman-planet`). Set `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `NEXT_PUBLIC_SITE_URL` in the project, then push to `main` or run `vercel deploy --prod`.
