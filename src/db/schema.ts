import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { ReleaseLink, Stem, Track } from "@/lib/types";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const noteKind = pgEnum("note_kind", ["sound", "lyrics", "production"]);
export const noteStatus = pgEnum("note_status", ["draft", "in_review", "approved"]);

export const tracks = pgTable("tracks", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  year: text("year").notNull(),
  duration: integer("duration").notNull(),
  hookAt: integer("hook_at").notNull(),
  stems: jsonb("stems").$type<Stem[]>().notNull(),
  credits: jsonb("credits").$type<Track["credits"]>().notNull(),
  releases: jsonb("releases").$type<ReleaseLink[]>().notNull(),
  related: jsonb("related").$type<Track["related"]>().notNull(),
  liveUpdate: jsonb("live_update").$type<Track["liveUpdate"]>(),
  placeholderMedia: boolean("placeholder_media").notNull().default(true),
  spotifyTrackId: text("spotify_track_id"),
  previewUrl: text("preview_url"),
  artworkUrl: text("artwork_url"),
});

export const notes = pgTable(
  "notes",
  {
    id: text("id").primaryKey(),
    trackSlug: text("track_slug")
      .notNull()
      .references(() => tracks.slug, { onDelete: "cascade" }),
    t: integer("t").notNull(),
    kind: noteKind("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    credits: jsonb("credits").$type<string[]>().notNull().default([]),
    layers: jsonb("layers").$type<string[]>(),
    status: noteStatus("status").notNull().default("draft"),
    approvedBy: text("approved_by"),
    approvedAt: text("approved_at"),
    placeholder: boolean("placeholder").notNull().default(true),
  },
  (t) => [index("notes_track_status_idx").on(t.trackSlug, t.status)],
);

export const follows = pgTable(
  "follows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trackSlug: text("track_slug")
      .notNull()
      .references(() => tracks.slug, { onDelete: "cascade" }),
    momentT: integer("moment_t"),
    contact: text("contact").notNull(),
    city: text("city").notNull(),
    ticketIntent: boolean("ticket_intent").notNull().default(false),
    consent: boolean("consent").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("follows_city_idx").on(t.city)],
);

// --- The Pack: Herman's fan community ---

export const packPostStatus = pgEnum("pack_post_status", ["pending", "featured", "hidden"]);
export const packItemKind = pgEnum("pack_item_kind", ["merch", "unreleased"]);
export const liveStatus = pgEnum("live_status", ["draft", "live", "closed"]);

/** Site-wide text the team can change, e.g. the pack's name. */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/** A fan's note for the wall. Shown only after the team features it. */
export const packPosts = pgTable(
  "pack_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    city: text("city"),
    message: text("message").notNull(),
    song: text("song"),
    status: packPostStatus("status").notNull().default("pending"),
    /** Seeded example data, tagged "Sample" on the site and removable in one click. */
    sample: boolean("sample").notNull().default(false),
    consent: boolean("consent").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pack_posts_status_idx").on(t.status)],
);

/** Merch and unreleased music. Payment happens on the team's own checkout link. */
export const packItems = pgTable("pack_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: packItemKind("kind").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  imageUrl: text("image_url"),
  previewUrl: text("preview_url"),
  /** Optional external checkout. Without it, fans place an order and the team sends payment details. */
  buyUrl: text("buy_url"),
  /** Decimal amount for online payment, e.g. "250.00". Empty = no online payment. */
  amount: text("amount"),
  /** ISO currency for online payment, e.g. "GHS". */
  currency: text("currency").notNull().default("GHS"),
  /** Comma-separated sizes or options, e.g. "S, M, L, XL". */
  sizes: text("sizes"),
  status: liveStatus("status").notNull().default("draft"),
  sample: boolean("sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const giveaways = pgTable("giveaways", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  prize: text("prize").notNull(),
  details: text("details"),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: liveStatus("status").notNull().default("draft"),
  winner: text("winner"),
  sample: boolean("sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderStatus = pgEnum("order_status", ["new", "confirmed", "paid", "fulfilled", "cancelled"]);

/** A fan's order. The team confirms it and sends payment details; this site takes no money. */
export const packOrders = pgTable("pack_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => packItems.id, { onDelete: "cascade" }),
  size: text("size"),
  quantity: integer("quantity").notNull().default(1),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  city: text("city").notNull(),
  note: text("note"),
  status: orderStatus("status").notNull().default("new"),
  /** Bachs checkout session for online payment, when used. */
  checkoutId: text("checkout_id"),
  sample: boolean("sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const giveawayEntries = pgTable(
  "giveaway_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    giveawayId: uuid("giveaway_id")
      .notNull()
      .references(() => giveaways.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contact: text("contact").notNull(),
    city: text("city"),
    consent: boolean("consent").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("giveaway_entries_once_idx").on(t.giveawayId, t.contact)],
);

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

/** Photos the team uploads in Studio (merch, unreleased covers). Served from /api/pack-image/<id>. */
export const packImages = pgTable("pack_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  mime: text("mime").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Shows and meetups ---

export const eventKind = pgEnum("event_kind", ["show", "meetup"]);

/** A show (ticketed) or a meetup (free or ticketed), created in Studio. */
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: eventKind("kind").notNull(),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  details: text("details"),
  imageUrl: text("image_url"),
  /** Shown price, e.g. "GH₵ 150". Empty = free. */
  price: text("price"),
  /** Decimal amount Bachs charges per ticket. Empty = free or pay on contact. */
  amount: text("amount"),
  currency: text("currency").notNull().default("GHS"),
  capacity: integer("capacity"),
  status: liveStatus("status").notNull().default("draft"),
  sample: boolean("sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** A fan's tickets or RSVP. Free events confirm straight away. */
export const eventTickets = pgTable("event_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  quantity: integer("quantity").notNull().default(1),
  status: orderStatus("status").notNull().default("new"),
  checkoutId: text("checkout_id"),
  sample: boolean("sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
