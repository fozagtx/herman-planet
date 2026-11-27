CREATE TYPE "public"."live_status" AS ENUM('draft', 'live', 'closed');--> statement-breakpoint
CREATE TYPE "public"."pack_item_kind" AS ENUM('merch', 'unreleased');--> statement-breakpoint
CREATE TYPE "public"."pack_post_status" AS ENUM('pending', 'featured', 'hidden');--> statement-breakpoint
CREATE TABLE "giveaway_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"giveaway_id" uuid NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"city" text,
	"consent" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "giveaways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"prize" text NOT NULL,
	"details" text,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "live_status" DEFAULT 'draft' NOT NULL,
	"winner" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "pack_item_kind" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" text NOT NULL,
	"image_url" text,
	"preview_url" text,
	"buy_url" text NOT NULL,
	"status" "live_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"message" text NOT NULL,
	"song" text,
	"status" "pack_post_status" DEFAULT 'pending' NOT NULL,
	"consent" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "giveaway_entries" ADD CONSTRAINT "giveaway_entries_giveaway_id_giveaways_id_fk" FOREIGN KEY ("giveaway_id") REFERENCES "public"."giveaways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "giveaway_entries_once_idx" ON "giveaway_entries" USING btree ("giveaway_id","contact");--> statement-breakpoint
CREATE INDEX "pack_posts_status_idx" ON "pack_posts" USING btree ("status");