# Herman Planet

A home for Herman Suede where a fan hears a song, learns what went into it, and joins his community for shows, merch and giveaways, while his team runs everything from one private page.

**Live:** [herman-planet.vercel.app](https://herman-planet.vercel.app) · **Docs:** [docs/](docs/README.md) · **Studio access:** [ACCESS.md](ACCESS.md)

## What is it?

Herman Planet has five parts:

| Part | What it does | Status |
|---|---|---|
| **Fan site** | The home page: his music, the new single, every release with its story, a mood dial, streams, video | Required |
| **Song pages** | A page for every release at `/t/<song>`: the full song through Spotify, timed notes on the sound, lyrics and production, credits, a share link for any moment | Required |
| **The Pack** | His fan community at `/pack`: shows and meetups with tickets, merch, unreleased music, giveaways, a fan wall | Required |
| **Studio** | The team's private admin at `/studio`, behind an access code | Required |
| **Payments** | Card and mobile money through [Bachs](https://bachs.io) | Optional; without it fans order and the team contacts them |

Herman's team stays in charge. Nothing a fan reads, buys or sees goes live until the team approves it in Studio.

## How it works

```text
              A fan opens a shared song link
                            |
                            v
              Song page starts at the marked moment
                            |
                            v
        Timed notes: the sound, the words, who made it
                            |
                            v
          Official release on Spotify, Apple Music, YouTube
                            |
                            v
                    The Pack: come back
     shows and meetups  |  merch  |  giveaways  |  fan wall
                            |
                            v
     Pay with Bachs     or     Herman's team contacts you
                            |
                            v
        Studio: the team sees every order, booking and note
```

Notes, fan wall posts, merch, events and giveaways all wait in Studio until the team puts them live. Payments count only when Bachs confirms them.

## Why use it?

It starts with the music. A shared link drops the listener straight into the moment that matters.

It tells the real story. Every note, song story and number comes from Herman's team or a published source, and the page says which.

It turns listeners into a community. The Pack gives fans a place to come back to: see him live, buy merch, win something, get featured.

It is run by the team, not a developer. Photos, prices, show dates and giveaways are managed in Studio with no code.

It takes payments the way Ghana pays. Bachs checkout accepts cards and mobile money.

Results depend on the team keeping Studio up to date. Stream counts are a dated snapshot, not live figures.

## Install

You need Node.js 22 or later and a free [Neon](https://neon.com) Postgres database.

```bash
git clone https://github.com/fozagtx/herman-planet.git
cd herman-planet
npm install
cp .env.example .env.local
```

Fill in `.env.local` as described in [Configuration](docs/configuration.md), then create the tables:

```bash
npm run db:migrate
npm run db:seed
```

## Quick start

**Full setup, with payments**

```bash
npm run db:seed-pack        # sample shop items, a giveaway, a show and a meetup
npm run dev                 # http://localhost:3000
```

Add `BACHS_API_KEY` and `BACHS_WEBHOOK_SECRET` first. [Payments with Bachs](docs/payments-bachs.md) walks through signing up at [app.bachs.io/signup](https://app.bachs.io/signup), creating a sandbox key and adding the webhook.

**Without payments**

```bash
npm run dev
```

Leave the Bachs variables empty. Fans can still order merch and book shows; Herman's team contacts them from Studio.

**Minimal, just the music**

```bash
npm run db:seed && npm run dev
```

Skip the Pack samples. The home page and every song page work on their own.

After it starts, open `/studio` and enter your `STUDIO_ACCESS_CODE`. For the live demo, the code is in [ACCESS.md](ACCESS.md).

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon pooled connection |
| `DATABASE_URL_UNPOOLED` | Yes | Neon direct connection, for migrations |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public address, for share images and checkout returns |
| `STUDIO_ACCESS_CODE` | Yes | The team access code for Studio. Choose any code when you deploy your own copy |
| `BACHS_API_KEY` | For payments | `sk_sandbox_` to test, `sk_live_` for real money |
| `BACHS_WEBHOOK_SECRET` | For payments | Signing secret of your Bachs webhook |

Never paste keys into chats, issues or screenshots. Keep them in `.env.local` and in Vercel. Full details: [Configuration](docs/configuration.md).

## Useful commands

```text
npm run dev             start locally
npm run build           production build
npm run lint            lint
npm run db:generate     write a migration after changing src/db/schema.ts
npm run db:migrate      apply migrations
npm run db:seed         She Get and its timed notes
npm run db:seed-pack    sample Pack content, tagged Sample
vercel deploy --prod    deploy to Vercel
```

## Documentation

| Guide | For |
|---|---|
| [Getting started](docs/getting-started.md) | Running it on your machine |
| [Configuration](docs/configuration.md) | Every setting, and how the access code protects Studio |
| [Studio guide](docs/studio-guide.md) | The team: notes, merch, shows, giveaways, fan wall |
| [Payments with Bachs](docs/payments-bachs.md) | Signing up, keys, webhook, testing, going live |
| [Deployment](docs/deployment.md) | Putting your own copy live on Vercel |
| [API reference](docs/api-reference.md) | Every page, route, server action and external service |
| [Data model](docs/data-model.md) | Tables and the rules they follow |
| [Content and sources](docs/content-and-sources.md) | Where every fact, number and image comes from |
| [Design system](docs/design-system.md) | Colours, type and components |
| [Troubleshooting](docs/troubleshooting.md) | Common problems and fixes |

## Important limits

Herman's team is the final authority. Fans only see approved notes, featured wall posts, live items and live events.

Studio requires the access code. Every admin action checks it again on the server, and wrong codes are slowed down.

This site never stores card or mobile money details. Bachs handles payment, and an order turns Paid only from a signed Bachs webhook or a status check with Bachs.

Sample content is tagged Sample on the site and is never charged.

Signed out of Spotify, a song page plays Spotify's 30 second preview and says so.

Stream counts and song stories are dated snapshots from published sources. Update them as new numbers and interviews come out.

## Update

```bash
git pull
npm install
npm run db:migrate
vercel deploy --prod
```

Run the migrations before deploying a version that changes the database.

## Remove

Remove the Vercel project, delete the Neon project, and revoke the Bachs keys and webhook in the Bachs Developer Portal. Uploaded photos and orders live in the Neon database and go with it.

## Development

```bash
npm install
npx tsc --noEmit
npm run lint
npm run build
```

Built with Next.js 16, React 19, Tailwind CSS 4, Neon Postgres with Drizzle, the Bachs Node SDK, the Spotify embed, islandcn, GSAP, Framer Motion and Lenis. Photo credits are in [Content and sources](docs/content-and-sources.md).

## License

Private. All rights reserved by Herman Suede and his team.
