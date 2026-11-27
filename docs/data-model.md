# Data model

Tables live in `src/db/schema.ts`. Migrations are in `src/db/migrations`.

| Table | Holds |
|---|---|
| `tracks` | Song pages the team manages: Spotify id, artwork, credits, release links, live update |
| `notes` | Timed notes: second, kind, text, credits, status `draft`, `in_review` or `approved` |
| `site_settings` | Team settings such as the Pack's name |
| `pack_posts` | Fan wall notes, status `pending`, `featured` or `hidden` |
| `pack_items` | Merch and unreleased music: price shown, Bachs amount and currency, sizes, photo |
| `pack_orders` | Orders, status `new`, `confirmed`, `paid`, `fulfilled` or `cancelled`, plus the Bachs checkout id |
| `events` | Shows and meetups: date, venue, city, price, amount, capacity |
| `event_tickets` | Bookings and RSVPs, same statuses as orders |
| `giveaways` | Giveaways and their winner |
| `giveaway_entries` | One entry per contact per giveaway |
| `pack_images` | Photos uploaded in Studio |

## Rules

1. Fans only see approved notes, featured wall posts, live items and live upcoming events.
2. Editing an approved note sends it back to review, because approval covers the exact words.
3. Booking checks capacity inside a transaction that locks the event row, so two fans cannot take the last place.
4. An order or ticket becomes `paid` only from a signed Bachs webhook or a status check with Bachs.
5. Rows with `sample = true` are tagged "Sample" on the site, never charged, and removed together from Studio.

## Changing the schema

```bash
npm run db:generate   # writes a migration from schema.ts
npm run db:migrate    # applies it
```
