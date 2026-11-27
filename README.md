# Behind the Hook · Herman Suede

A track-first home for Herman Suede. A listener lands on a song, hears it, opens the story behind specific moments (sound, lyrics, production, credits), goes to the official release, and follows Herman for what comes next. His team runs all of it from one page, `/studio`.

Live: https://herman-planet.vercel.app

| Route | Who it's for | What it does |
|---|---|---|
| `/` | Listeners | Herman's site: the new single, every release with previews, his Spotify numbers, about, lines from the song, eight years of covers, video, follow |
| `/t/she-get` | Listeners | The track page: the real song via Spotify, timed moments, credits, more releases, follow |
| `/t/she-get/m/42` | Shared links | Same page, opened on a marked moment (here 0:42), with its own share image |
| `/studio` | Herman's team (passcode) | Approve notes, edit track details and links, publish a live update, add tracks |

## How it answers the brief

| Brief | Where |
|---|---|
| 01 Hear it: a fan arrives through a shared song or clip | Moment links (`/t/[slug]/m/[seconds]`) open on that second; the share sheet on every moment makes them |
| 02 Explore: approved preview with timed notes, with credits | Timeline markers and a moment list; each note has its body, credits and source |
| 03 Listen in full: official release, related tracks | Spotify, Apple Music and YouTube buttons; "More from Herman" carousel with playable previews |
| 04 Come back: follow future releases, approved live update | "Follow on Spotify", Apple Music, YouTube, Instagram; the Live card shows an update only after the team approves it in Studio |
| Demo: jump to a marked moment, open the production note, move to the official release | Open `/t/she-get/m/20`, press Play, read the note, press Spotify |
| Artist-approved notes | Fans only ever load notes with `status = approved` (enforced in the query, `src/lib/store.ts`) |
| Cleared media | The song plays through Spotify's official embed; previews and artwork are Apple's official assets |
| Working links | Every outbound link was checked to return 200 on 27 Nov 2026 |
| City-by-city demand | Left as a question for Herman's team, as the brief says. No fan data is collected. |

## Studio: the team's backend

`/studio` is the one place Herman's team changes the site. Sign in with the shared passcode (`STUDIO_PASSCODE`).

- **Timed notes:** add a note at a second in the song, send it for review, approve it. Editing a live note sends it back to review, because approval covers the exact words.
- **Live update:** write a title and details, tick "Approved" and it shows in the Live card on the home and track pages. Unapproved, fans see "New dates, coming soon."
- **Track details:** title, year, length, hook second, Spotify track link, cover image, release links, credits (`Role: Name` per line).
- **Add a track:** title, year, length, Spotify link, cover. It goes live at `/t/<title>`.

Security: the session cookie holds an HMAC of the passcode, not the passcode. Every Studio server action calls `requireTeam()` first, because server actions can be called by direct POST. Rotate the passcode by changing `STUDIO_PASSCODE` and redeploying; everyone is signed out.

## What is real and what is not

Real:
- "She Get" (released 25 Nov 2026) plays through the Spotify embed. Signed in to Spotify, a listener hears the full song and can jump to any moment. Signed out, Spotify plays its own 30 second preview and the page says so.
- Covers and 30 second previews come from Apple (iTunes Lookup API). Credits are as reported at release (MILN, BNYX®, realsmart, rain. labs). The One by One video is the official upload.
- Spotify numbers (17,445 monthly listeners; plays per song) were read from his public artist page on 27 Nov 2026. Spotify's API no longer exposes play counts, so `src/lib/stats.ts` is updated by hand.
- Notes, track details and live updates are stored in Neon Postgres.

Not yet from Herman's team:
- Note text is drawn from published coverage of the single. Those notes show "From the release coverage" instead of an approval badge until the team rewrites and approves them in Studio.
- Note timestamps are estimates. The team sets the real seconds in Studio.
- No shows are announced, so the Live card reads "New dates, coming soon."

## Design

- **Paper & Ink**: warm paper, violet-black ink, colour only where it means something (peach, coral and lavender mark Sound, Lyrics and Production; `#edff00` on ink marks "Approved"). Geist for text, Instrument Serif for display.
- **Mobile first**: every section checked at 375px with no sideways scroll. On phones the track page puts a small cover beside the title so the moments are in the first screen.
- **Motion**: a 2 second first-visit intro, sections that ease in on scroll, Lenis smooth scroll. All of it is off for visitors who prefer reduced motion.
- **Live status island (islandcn)**: one black pill at the top of every page. It shows what is playing (hero previews, the release carousel, the song on the track page with the moment you are in) and, in Studio, each save: a spinner, then a check, "Live" on approve, or what to fix. No demo data: it only appears for real playback and real saves.
- **Players stay in sync**: the hero player, the release carousel player and the Spotify preview all show live progress.
- **Accessibility**: 44px touch targets, a visible ink focus ring on everything, a keyboard-operable timeline (arrow keys seek 5 seconds), labelled form fields, skeletons while loading.

VengeanceUI components and what each one does here:

| Component | Job |
|---|---|
| Intro (own, GSAP) | "Welcome to Herman Planet": his face pops up as a planet, the name rises, the planet fills the screen and wipes into the homepage. About 2 seconds, once per session, tap or Enter skips, off for reduced motion |
| Magnetic Spotlight Marquee | Hero: his photo and covers move past; hover pauses, a tap plays that song's preview |
| Glow Border Card | The new single's cover, edged in the three note colours |
| Diagonal Carousel + Music Player | Every release. Won a side-by-side test against Perspective, Cylinder and Circular: it keeps square covers whole, shows titles and can drive the player |
| Circular Gallery | A ring of his covers around his Spotify monthly listeners |
| Gooey Text Reveal | His two-sentence bio (from his Spotify profile), revealed on scroll |
| Verse Cards | Lines from "She Get", dealt over the cover |
| Image Collage | Eight years of covers; tap to line them up, 2018 to 2026 |
| Share Sheet | Share the song or a moment (copy, QR, apps) |
| Aurora Hero, Candy Button, Awwwards Nav | Closing band, primary buttons, bottom dock |

## Stack

- Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4
- Neon Postgres with Drizzle ORM (`src/db`)
- Spotify Embed iFrame API (`src/components/use-spotify-player.ts`); a Web Audio stem player for tracks with cleared stems (`src/components/use-stem-player.ts`)
- Lenis, GSAP, Framer Motion, react-icons (brand marks)

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in Neon strings and a Studio passcode
npm run db:migrate           # create tables
npm run db:seed              # add She Get and its notes (safe to re-run)
npm run dev
```

`.env.local`:

```
DATABASE_URL='postgresql://…-pooler…/neondb?sslmode=verify-full'
DATABASE_URL_UNPOOLED='postgresql://…/neondb?sslmode=verify-full'
NEXT_PUBLIC_SITE_URL='http://localhost:3000'
STUDIO_PASSCODE='a-long-random-string'
```

Health check: `GET /api/health` returns `{"status":"ok","database":"connected"}`.

## Data model

`src/db/schema.ts`

- `tracks`: slug, title, artist, year, duration, hook second, Spotify track id, artwork, preview, credits, release links, related tracks, live update (`{title, body, approved}`), optional stems.
- `notes`: track, second (`t`), kind, title, body, credits, optional stem layers, `status` (`draft`, `in_review`, `approved`), who approved and when.
- `follows`: kept from an earlier version; nothing writes to it now.

## Project layout

```
src/app/page.tsx                     landing
src/app/t/[slug]/...                 track page, moment links, share image
src/app/studio/                      Studio (sign-in, forms)
src/app/actions.ts                   every write, each behind requireTeam()
src/lib/auth.ts                      Studio session
src/lib/store.ts                     all database reads and writes
src/lib/catalogue.ts                 releases (Apple artwork and previews)
src/lib/stats.ts                     Spotify numbers, dated
src/lib/platforms.tsx                official profiles and brand marks
src/components/track-experience.tsx  track page
src/components/landing/*             landing sections
src/components/follow.tsx            follow + live update
```

## Deploy

The repo is connected to Vercel (`herman-planet`). Set `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEXT_PUBLIC_SITE_URL` and `STUDIO_PASSCODE` in the project, then push to `main` or run `vercel deploy --prod`.
