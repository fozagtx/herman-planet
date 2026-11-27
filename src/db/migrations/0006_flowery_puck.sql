CREATE TYPE "public"."event_kind" AS ENUM('show', 'meetup');--> statement-breakpoint
CREATE TABLE "event_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"checkout_id" text,
	"sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "event_kind" NOT NULL,
	"title" text NOT NULL,
	"venue" text NOT NULL,
	"city" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"details" text,
	"image_url" text,
	"price" text,
	"amount" text,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"capacity" integer,
	"status" "live_status" DEFAULT 'draft' NOT NULL,
	"sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;