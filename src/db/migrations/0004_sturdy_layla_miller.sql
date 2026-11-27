ALTER TYPE "public"."order_status" ADD VALUE 'paid' BEFORE 'fulfilled';--> statement-breakpoint
ALTER TABLE "pack_items" ADD COLUMN "amount" text;--> statement-breakpoint
ALTER TABLE "pack_items" ADD COLUMN "currency" text DEFAULT 'GHS' NOT NULL;--> statement-breakpoint
ALTER TABLE "pack_orders" ADD COLUMN "checkout_id" text;