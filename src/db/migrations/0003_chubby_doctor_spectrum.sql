CREATE TYPE "public"."order_status" AS ENUM('new', 'confirmed', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TABLE "pack_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"size" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"city" text NOT NULL,
	"note" text,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pack_items" ALTER COLUMN "buy_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "giveaways" ADD COLUMN "sample" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pack_items" ADD COLUMN "sizes" text;--> statement-breakpoint
ALTER TABLE "pack_items" ADD COLUMN "sample" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pack_posts" ADD COLUMN "sample" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pack_orders" ADD CONSTRAINT "pack_orders_item_id_pack_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."pack_items"("id") ON DELETE cascade ON UPDATE no action;