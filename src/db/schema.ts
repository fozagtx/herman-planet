import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
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
