CREATE TYPE "public"."note_kind" AS ENUM('sound', 'lyrics', 'production');--> statement-breakpoint
CREATE TYPE "public"."note_status" AS ENUM('draft', 'in_review', 'approved');--> statement-breakpoint
CREATE TABLE "follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_slug" text NOT NULL,
	"moment_t" integer,
	"contact" text NOT NULL,
	"city" text NOT NULL,
	"ticket_intent" boolean DEFAULT false NOT NULL,
	"consent" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"track_slug" text NOT NULL,
	"t" integer NOT NULL,
	"kind" "note_kind" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"credits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"layers" jsonb,
	"status" "note_status" DEFAULT 'draft' NOT NULL,
	"approved_by" text,
	"approved_at" text,
	"placeholder" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"year" text NOT NULL,
	"duration" integer NOT NULL,
	"hook_at" integer NOT NULL,
	"stems" jsonb NOT NULL,
	"credits" jsonb NOT NULL,
	"releases" jsonb NOT NULL,
	"related" jsonb NOT NULL,
	"live_update" jsonb,
	"placeholder_media" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_track_slug_tracks_slug_fk" FOREIGN KEY ("track_slug") REFERENCES "public"."tracks"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_track_slug_tracks_slug_fk" FOREIGN KEY ("track_slug") REFERENCES "public"."tracks"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "follows_city_idx" ON "follows" USING btree ("city");--> statement-breakpoint
CREATE INDEX "notes_track_status_idx" ON "notes" USING btree ("track_slug","status");