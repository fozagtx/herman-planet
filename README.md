# Herman Planet · Behind the Hook

Herman Suede's home on the web: a track-first fan site where a listener hears a song, opens the story behind specific moments, goes to the official release, and joins **the Pack**, his fan community, for shows, meetups, merch, unreleased music and giveaways. Herman's team runs all of it from a private page, **Studio**.

**Live:** https://herman-planet.vercel.app

---

## Table of contents

1. [What's in it](#1-whats-in-it)
2. [How it answers the brief](#2-how-it-answers-the-brief)
3. [Pages and routes](#3-pages-and-routes)
4. [Tech stack](#4-tech-stack)
5. [Project structure](#5-project-structure)
6. [Data model](#6-data-model)
7. [Run it locally](#7-run-it-locally)
8. [Environment variables](#8-environment-variables)
9. [Database: migrations and seed data](#9-database-migrations-and-seed-data)
10. [Deploy to Vercel](#10-deploy-to-vercel)
11. [Payments with Bachs](#11-payments-with-bachs)
12. [Studio: the team's guide](#12-studio-the-teams-guide)
13. [Content and sources](#13-content-and-sources)
14. [Design system](#14-design-system)
15. [Accessibility and quality](#15-accessibility-and-quality)
16. [Scripts](#16-scripts)
17. [Troubleshooting](#17-troubleshooting)
18. [Credits and licences](#18-credits-and-licences)

---

## 1. What's in it

**For listeners**

- **Welcome to Herman Planet:** a two second intro on each page load. Herman's face pops up as a planet, the name rises, and the layer wipes up into the site. Tap or Enter skips it. Off for reduced motion.
- **Hero:** his photo and covers move past. Hover pauses the strip, a tap plays that song's official preview.
- **New single, She Get:** a launch ticker, "Out now · Released N days ago", the comeback story, and the moments inside the song.
- **Every release:** a carousel of real covers; the active cover plays its preview and shows what inspired the song, with a link to the source.
- **Pick a mood:** a gear you rotate (drag, arrow keys or tap) to find songs for a mood. Moods come only from published song stories.
- **Streams:** 3.5M+ plays and counting (Spotify top four plus Audiomack), dated, with the breakdown.
- **Song pages for every release** (`/t/<song>`): the full song through Spotify where we have its id, Apple's official 30 second preview otherwise, timed moments, credits, the story.
- **Live status island:** one black pill at the top (islandcn) shows what's playing, opens like an iPhone's when a song starts, and shows each save in Studio.
- **Follow:** Spotify, Apple Music, YouTube, Instagram, and the next show or meetup.

**The Pack** (`/pack`), from Herman's own review

- **How the pack was built:** a sourced timeline from 2017 to 2026, with Sarkodie at 2019 and Drake under "Inspired by", each photo credited.
- **Shows & meetups:** tickets for shows, RSVP for free meetups, places left, capacity enforced.
- **Giveaway:** prize, live countdown, one entry per contact, random draw.
- **The wall:** fans post a note and the song that got them; only notes the team features appear.
- **Shop:** merch and unreleased music. Fans pay with Bachs (card or mobile money) or ask the team to contact them.

**For Herman's team** (`/studio`, passcode)

- Timed notes with approval, track details, live update, new tracks.
- The Pack: name, orders, shows and meetups with bookings, fan wall moderation, giveaways, shop with photo upload, sample data removal.

## 2. How it answers the brief

| Brief | Where |
|---|---|
| 01 Hear it: a fan arrives through a shared song or clip | Moment links (`/t/<song>/m/<seconds>`) open on that second, with a share image; the share sheet makes them |
| 02 Explore: approved preview, timed notes on sound, lyrics or production, with credits | Timeline markers and moment list on each song page; notes show only when approved in Studio |
| 03 Listen in full: official release, related tracks | Spotify, Apple Music and YouTube buttons; "More from Herman" carousel; a song page for every release |
| 04 Come back: follow future releases, approved live update | Follow buttons; the Live card shows the next show or an approved update |
| Demo: jump to a marked moment, open the production note, go to the official release | `/t/she-get/m/20` → Play → read the note → Spotify |
| Artist-approved notes | Enforced in the query (`src/lib/store.ts`): fans only ever load `approved` notes |
| Cleared media | Full songs via Spotify's official embed; previews and artwork are Apple's official assets |
| Working links | Every outbound link checked on 27 Nov 2026 |
| City-by-city demand | Left to Herman's team, as the brief says; no fan data collected for it |

## 3. Pages and routes

| Route | What it is |
|---|---|
| `/` | Home |
| `/t/<song>` | Song page, e.g. `/t/she-get`, `/t/one-by-one`, `/t/kumbaya` |
| `/t/<song>/m/<seconds>` | Song page opened on a moment, with its own share image |
| `/pack` | The Pack |
| `/pack/order/<id>` | Order result after checkout (verifies payment with Bachs) |
| `/pack/ticket/<id>` | Ticket result after checkout |
| `/studio` | Studio sign-in, notes, track details, live update, new tracks |
| `/studio/pack` | Studio for the Pack |
| `/api/webhooks/bachs` | Bachs webhook (signed) |
| `/api/pack-image/<id>` | Photos uploaded in Studio |
| `/api/health` | `{"status":"ok","database":"connected"}` |

Studio is not linked from the public site. Share its URL with the team only.

## 4. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Styling | Tailwind CSS 4, Paper & Ink tokens (`src/app/globals.css`) |
| Database | Neon Postgres, Drizzle ORM and drizzle-kit migrations |
| Payments | Bachs (`@bachs/sdk` 2.0.0): checkout sessions, signed webhooks |
| Playback | Spotify Embed iFrame API; Web Audio for previews and stems |
| Live status | islandcn (Dynamic Island engine, installed with shadcn) |
| Motion | GSAP, Framer Motion, Lenis smooth scroll |
| UI pieces | VengeanceUI (marquee, carousels, verse cards, aurora, glow border, share sheet, music player, dock), react-icons |
| Hosting | Vercel |

## 5. Project structure

```
src/
  app/
    page.tsx                    home
    t/[slug]/                   song pages, moment links, share image
    pack/                       the Pack, order and ticket result pages
    studio/                     Studio (sign-in, notes, track, live update)
    studio/pack/                Studio for the Pack
    api/                        webhooks/bachs, pack-image, health
    actions.ts                  Studio actions for notes and tracks
    pack-actions.ts             fan wall, giveaways, shop, orders
    event-actions.ts            shows, meetups, tickets
  components/
    landing/                    home sections (hero, intro, music, mood dial, stats…)
    pack/                       Pack forms, ticket sheet
    track-experience.tsx        song page
    islands.tsx                 live status activities
    ui/  islandcn/              vendored registry components
  db/
    schema.ts  migrations/      tables and migrations
    seed.ts  seed-pack.ts       track data; Pack sample data
  lib/
    store.ts  pack.ts  events.ts   database reads and writes
    auth.ts                     Studio session
    bachs.ts                    Bachs client
    catalogue.ts  stats.ts  platforms.tsx   releases, numbers, profiles
```

## 6. Data model

| Table | Holds |
|---|---|
| `tracks` | Song pages the team manages (She Get): Spotify id, artwork, credits, links, live update |
| `notes` | Timed notes: second, kind (sound, lyrics, production), text, credits, status (`draft`, `in_review`, `approved`) |
| `site_settings` | Team settings, e.g. the Pack's name |
| `pack_posts` | Fan wall notes, status (`pending`, `featured`, `hidden`) |
| `pack_items` | Merch and unreleased music: price shown, amount and currency for Bachs, sizes, photo |
| `pack_orders` | Orders: item, size, quantity, contact, status (`new`, `confirmed`, `paid`, `fulfilled`, `cancelled`), Bachs checkout id |
| `events` | Shows and meetups: date, venue, city, price, amount, capacity |
| `event_tickets` | Bookings and RSVPs, same statuses as orders |
| `giveaways`, `giveaway_entries` | Giveaways and one entry per contact |
| `pack_images` | Photos uploaded in Studio |

Rules worth knowing:
- Fans only see approved notes, featured wall posts, live items and live events.
- Editing an approved note sends it back to review.
- Ticket capacity is checked inside a transaction that locks the event row, so a show can't oversell.
- An order or ticket only becomes `paid` from a signed Bachs webhook or a status check with Bachs, never from the browser alone.
- Sample rows (`sample = true`) are tagged on the site, never charged, and removed in one click.

## 7. Run it locally

You need Node.js 22 or later and a Neon project (free tier is fine).

```bash
git clone https://github.com/fozagtx/herman-planet.git
cd herman-planet
npm install
cp .env.example .env.local      # then fill it in, see below
npm run db:migrate              # create the tables
npm run db:seed                 # She Get and its notes
npm run db:seed-pack            # optional: Pack sample data
npm run dev                     # http://localhost:3000
```

Check `http://localhost:3000/api/health` returns `"database":"connected"`.

## 8. Environment variables

| Name | Required | What it's for |
|---|---|---|
| `DATABASE_URL` | Yes | Neon pooled connection (host contains `-pooler`), `sslmode=verify-full` |
| `DATABASE_URL_UNPOOLED` | Yes | Neon direct connection, used by migrations and seeds |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public base URL, e.g. `https://herman-planet.vercel.app`; used for share images and checkout return links |
| `STUDIO_PASSCODE` | Yes | Shared passcode for `/studio`. Rotate it to sign everyone out |
| `BACHS_API_KEY` | For payments | `sk_sandbox_…` to test, `sk_live_…` for real money. Without it, buyers can only ask the team to contact them |
| `BACHS_WEBHOOK_SECRET` | For payments | Signing secret of your Bachs webhook endpoint |

Never commit `.env.local`. It's in `.gitignore`.

## 9. Database: migrations and seed data

- Change `src/db/schema.ts`, then `npm run db:generate` to write a migration and `npm run db:migrate` to apply it.
- `npm run db:seed` adds the She Get track and its notes. Safe to re-run.
- `npm run db:seed-pack` adds sample wall notes, shop items, a giveaway, a show and a meetup, all tagged **Sample**. Remove them in Studio → The Pack → "Remove all sample data".

## 10. Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel (or run `vercel link`).
2. Add the variables from section 8 to the Production environment.
3. Run the migrations once against the production database: `npm run db:migrate` with `.env.local` pointing at it.
4. Deploy: push to `main`, or `vercel deploy --prod`.
5. Check `/api/health`, open `/`, `/pack` and `/studio`.

`NEXT_PUBLIC_*` values are built into the bundle, so redeploy after changing one.

## 11. Payments with Bachs

**Setup**

1. Create a sandbox key in Bachs and set `BACHS_API_KEY`.
2. In the Bachs dashboard, add a webhook to `https://<your-domain>/api/webhooks/bachs` and set `BACHS_WEBHOOK_SECRET` to its signing secret.
3. In Studio, give each item or event an **amount** and **currency** (e.g. `150.00`, `GHS`).
4. When everything works in sandbox, swap in your `sk_live_` key. No code changes.

**Flow**

1. The fan presses Buy or Get tickets and chooses **Pay now with Bachs** or **Have Herman's team contact me**.
2. With Bachs: the site creates the order or ticket, then a Bachs checkout session with `reference` set to its id and `metadata` describing it, and sends the fan to `checkout_url`. Payment methods include cards and mobile money (e.g. MoMo GHS).
3. The order turns **Paid** when the signed webhook arrives, or when the fan returns to the result page and the site asks Bachs for the checkout's status.
4. With "contact me": the order or ticket is held and the team follows up from Studio.

Samples never create a checkout. Writes to Bachs use an idempotency key per order or ticket.

## 12. Studio: the team's guide

Open `/studio` and sign in with the passcode.

**Studio**
- **Timed notes:** add a note at a second in the song, send it for review, approve it. Only approved notes reach fans.
- **Live update:** write it, tick Approved, save. It shows in the Live card.
- **Track details:** title, Spotify link, cover, release links, credits (`Role: Name` per line).
- **Add a track:** gives it a page at `/t/<title>`.

**The Pack** (button at the top of Studio)
- **Orders:** confirm, mark delivered, or cancel. Paid orders show as Paid.
- **Shows & meetups:** add an event (photo, venue, date, price, amount, capacity), open or close bookings, confirm or cancel each booking, edit or delete.
- **Name:** what Herman calls his fans.
- **Fan wall:** feature or hide notes.
- **Giveaways:** create, open, pause, draw a random winner. The site shows a winner's first name and city only.
- **Shop:** upload a photo, set the price shown, the Bachs amount and sizes, tick "In the shop". Edit or delete any item.

Every save shows on the island at the top: a spinner, then a check, "Live" or what to fix.

## 13. Content and sources

Nothing on the site is invented. Where we didn't have the team's own words, content comes from published sources and says so.

- **Song stories:** Unorthodox Reviews, Ghana Music, Beatz Nation, The Vaultz, DCLeakers, Citi Newsroom. Each card links to its source.
- **Timeline:** The Upper Entertainment, Ghana Music, Unorthodox Reviews, Wikipedia (Black Love), The Vaultz.
- **Streams:** Spotify artist page and Audiomack, counted 27 Nov 2026. Update `src/lib/stats.ts` by hand (Spotify's API no longer exposes play counts).
- **She Get notes:** drafted from release coverage and labelled "From the release coverage" until the team rewrites and approves them. Their timestamps are estimates.
- **Sample data:** tagged "Sample" everywhere and never charged.

## 14. Design system

- **Paper & Ink:** warm paper `#efeeea`, violet-black ink `#1d1730`. Colour only where it means something: peach, coral and lavender mark Sound, Lyrics and Production; `#edff00` marks "live" and progress.
- **Type:** Geist for text, Instrument Serif for display.
- **Surfaces:** one card style (`.surface`), pill buttons with 44px targets and press feedback.
- **Mobile first:** every page checked at 375px with no sideways scroll.

## 15. Accessibility and quality

- Visible ink focus ring on every control; dialogs trap focus.
- Keyboard-operable timeline (arrow keys seek) and mood dial.
- Labelled form fields, plain one-line errors, skeletons while loading.
- All motion is off with `prefers-reduced-motion`.
- `npx tsc --noEmit` and `npx eslint src` are clean (vendored registry code is excluded from lint).

## 16. Scripts

| Script | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Write a migration from `schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | She Get and its notes |
| `npm run db:seed-pack` | Pack sample data |

## 17. Troubleshooting

| Symptom | Fix |
|---|---|
| `/api/health` says unreachable | Check `DATABASE_URL`; Neon may be waking from idle, retry |
| Studio keeps asking for the passcode | `STUDIO_PASSCODE` isn't set in that environment |
| Buy only offers "contact me" | `BACHS_API_KEY` isn't set, or the item has no amount |
| Orders never turn Paid | Check the webhook URL and `BACHS_WEBHOOK_SECRET`; the endpoint returns 503 when the secret is missing |
| Song page plays only 30 seconds | The visitor isn't signed in to Spotify; the page says so |
| Share images show localhost | Set `NEXT_PUBLIC_SITE_URL` and redeploy |
| Photo upload fails | Use JPG, PNG or WebP under 2.5 MB (photos are resized in the browser first) |

## 18. Credits and licences

- **Wolf photo:** Rob Bertrand, Pexels (Pexels licence).
- **Sarkodie photo:** Owula kpakpo, CC BY-SA 4.0, Wikimedia Commons.
- **Drake photo:** The Come Up Show, CC BY 2.0, Wikimedia Commons. Drake is not affiliated with this site.
- **Cover art and previews:** Apple Music (iTunes Lookup API). **Full songs:** Spotify embed.
- **Components:** VengeanceUI, islandcn (Hugeicons glyphs, MIT), shadcn/ui.
- **Herman's photo:** from the project brief.
