# API reference

The app uses Next.js pages, route handlers and server actions. Admin actions run only with a valid Studio session.

## Pages

| Route | Who | What |
|---|---|---|
| `/` | Fans | Home |
| `/t/<song>` | Fans | Song page for any release, for example `/t/she-get`, `/t/kumbaya` |
| `/t/<song>/m/<seconds>` | Fans | Song page opened on a moment, with its own share image |
| `/pack` | Fans | The Pack |
| `/pack/order/<id>` | Fans | Order result; checks payment with Bachs |
| `/pack/ticket/<id>` | Fans | Ticket result; checks payment with Bachs |
| `/studio` | Team | Studio (access code) |
| `/studio/pack` | Team | Studio for the Pack (access code) |

## Route handlers

| Method and route | What it does |
|---|---|
| `GET /api/health` | Database check. Returns `{"status":"ok","database":"connected"}` or `503`. |
| `GET /api/pack-image/<id>` | Serves a photo uploaded in Studio, cached for a year. |
| `POST /api/webhooks/bachs` | Bachs webhook. Verifies the signature, marks orders and tickets Paid. See [Payments with Bachs](payments-bachs.md). |
| `GET /t/<song>/m/<seconds>/opengraph-image` | Share image for a moment link. |

## Server actions for fans

These are public and validate every field. Each has a hidden spam trap.

| Action | File | Does |
|---|---|---|
| `joinWall` | `src/app/pack-actions.ts` | Sends a note to the fan wall for review |
| `enterGiveaway` | `src/app/pack-actions.ts` | One entry per contact per giveaway |
| `placeOrder` | `src/app/pack-actions.ts` | Creates an order; with Bachs, creates a checkout and returns its URL |
| `bookTickets` | `src/app/event-actions.ts` | Reserves places within capacity; free events confirm at once; paid events go to Bachs or the team |
| `signIn` | `src/app/actions.ts` | Checks the access code and starts a Studio session |

## Server actions for the team

Every one of these calls `requireTeam()` first and refuses without a valid session.

| File | Actions |
|---|---|
| `src/app/actions.ts` | `signOut`, `setNoteStatus`, `saveNote`, `saveTrack`, `saveLiveUpdate`, `addTrack` |
| `src/app/pack-actions.ts` | `savePackName`, `moderatePost`, `saveShopItem`, `toggleItem`, `removeItem`, `orderStatus`, `saveGiveawayAction`, `giveawayStatus`, `pickWinner`, `clearSamples` |
| `src/app/event-actions.ts` | `saveEventAction`, `eventStatus`, `removeEvent`, `ticketStatus` |

## External services

| Service | Used for | Where |
|---|---|---|
| Neon Postgres | All data | `src/db`, `src/lib/store.ts`, `src/lib/pack.ts`, `src/lib/events.ts` |
| Bachs | Checkout sessions, status checks, webhooks | `src/lib/bachs.ts`, actions above, webhook route |
| Spotify Embed iFrame API | Full songs on song pages | `src/components/use-spotify-player.ts` |
| Apple iTunes previews and artwork | 30 second previews, cover art | `src/lib/catalogue.ts` |
| YouTube (no cookie embed) | The One by One video | `src/components/landing/video.tsx` |
