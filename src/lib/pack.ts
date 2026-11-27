import "server-only";
import { and, asc, count, desc, eq, gt, inArray } from "drizzle-orm";
import { connection } from "next/server";
import { db, giveawayEntries, giveaways, packImages, packItems, packOrders, packPosts, siteSettings } from "@/db";

export type PackPost = typeof packPosts.$inferSelect;
export type PackItem = typeof packItems.$inferSelect;
export type Giveaway = typeof giveaways.$inferSelect;
export type PackOrder = typeof packOrders.$inferSelect;

const DEFAULT_PACK_NAME = "The Pack";

export async function getPackName(): Promise<string> {
  await connection();
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, "pack_name")).limit(1);
  return row?.value || DEFAULT_PACK_NAME;
}

export async function setPackName(name: string) {
  await db.insert(siteSettings).values({ key: "pack_name", value: name }).onConflictDoUpdate({ target: siteSettings.key, set: { value: name } });
}

// Fan wall
export async function getFeaturedPosts(limit = 24): Promise<PackPost[]> {
  await connection();
  return db.select().from(packPosts).where(eq(packPosts.status, "featured")).orderBy(desc(packPosts.createdAt)).limit(limit);
}
export async function getAllPosts(): Promise<PackPost[]> {
  await connection();
  return db.select().from(packPosts).orderBy(desc(packPosts.createdAt)).limit(200);
}
export async function addPost(p: Pick<PackPost, "name" | "city" | "message" | "song" | "consent">) {
  await db.insert(packPosts).values(p);
}
export async function setPostStatus(id: string, status: PackPost["status"]) {
  await db.update(packPosts).set({ status }).where(eq(packPosts.id, id));
}

// Shop
export async function getLiveItems(): Promise<PackItem[]> {
  await connection();
  return db.select().from(packItems).where(eq(packItems.status, "live")).orderBy(asc(packItems.createdAt));
}
export async function getAllItems(): Promise<PackItem[]> {
  await connection();
  return db.select().from(packItems).orderBy(desc(packItems.createdAt));
}
export async function saveItem(id: string | null, v: Omit<typeof packItems.$inferInsert, "id" | "createdAt">) {
  if (id) await db.update(packItems).set(v).where(eq(packItems.id, id));
  else await db.insert(packItems).values(v);
}
export async function setItemStatus(id: string, status: PackItem["status"]) {
  await db.update(packItems).set({ status }).where(eq(packItems.id, id));
}

// Giveaways
/** The giveaway fans can enter now: live and not yet ended. */
export async function getOpenGiveaway(): Promise<Giveaway | undefined> {
  await connection();
  const [g] = await db.select().from(giveaways).where(and(eq(giveaways.status, "live"), gt(giveaways.endsAt, new Date()))).orderBy(asc(giveaways.endsAt)).limit(1);
  return g;
}
/** The latest closed giveaway with a winner, to show the result. */
export async function getLastWinner(): Promise<Giveaway | undefined> {
  await connection();
  const rows = await db.select().from(giveaways).where(eq(giveaways.status, "closed")).orderBy(desc(giveaways.endsAt)).limit(5);
  return rows.find((g) => g.winner);
}
export async function getAllGiveaways(): Promise<(Giveaway & { entries: number })[]> {
  await connection();
  const rows = await db.select().from(giveaways).orderBy(desc(giveaways.createdAt));
  const counts = await db.select({ id: giveawayEntries.giveawayId, n: count() }).from(giveawayEntries).groupBy(giveawayEntries.giveawayId);
  return rows.map((g) => ({ ...g, entries: counts.find((c) => c.id === g.id)?.n ?? 0 }));
}
export async function saveGiveaway(id: string | null, v: Omit<typeof giveaways.$inferInsert, "id" | "createdAt">) {
  if (id) await db.update(giveaways).set(v).where(eq(giveaways.id, id));
  else await db.insert(giveaways).values(v);
}
export async function setGiveawayStatus(id: string, status: Giveaway["status"]) {
  await db.update(giveaways).set({ status }).where(eq(giveaways.id, id));
}
/** Enter once per contact per giveaway. Returns false if this contact already entered. */
export async function addEntry(e: typeof giveawayEntries.$inferInsert): Promise<boolean> {
  const res = await db.insert(giveawayEntries).values(e).onConflictDoNothing().returning({ id: giveawayEntries.id });
  return res.length > 0;
}
/** Picks a random entry as the winner, closes the giveaway, and returns the winner's first name and city. */
export async function drawWinner(id: string): Promise<string | null> {
  const entries = await db.select().from(giveawayEntries).where(eq(giveawayEntries.giveawayId, id));
  if (entries.length === 0) return null;
  const pick = entries[Math.floor(Math.random() * entries.length)];
  // Public result shows a first name and city only, never contact details.
  const shown = `${pick.name.split(/\s+/)[0]}${pick.city ? `, ${pick.city}` : ""}`;
  await db.update(giveaways).set({ winner: shown, status: "closed" }).where(eq(giveaways.id, id));
  return `${pick.name} · ${pick.contact}`;
}
export async function getEntries(id: string) {
  await connection();
  return db.select().from(giveawayEntries).where(eq(giveawayEntries.giveawayId, id)).orderBy(asc(giveawayEntries.createdAt));
}

// Orders: fans order, the team confirms and sends payment details.
export async function getItem(id: string): Promise<PackItem | undefined> {
  const [i] = await db.select().from(packItems).where(eq(packItems.id, id)).limit(1);
  return i;
}
export async function addOrder(o: typeof packOrders.$inferInsert): Promise<PackOrder> {
  const [row] = await db.insert(packOrders).values(o).returning();
  return row;
}
export async function getOrder(id: string): Promise<(PackOrder & { item: string }) | undefined> {
  const [r] = await db.select({ o: packOrders, item: packItems.title }).from(packOrders).innerJoin(packItems, eq(packOrders.itemId, packItems.id)).where(eq(packOrders.id, id)).limit(1);
  return r ? { ...r.o, item: r.item } : undefined;
}
export async function setOrderCheckout(id: string, checkoutId: string) {
  await db.update(packOrders).set({ checkoutId }).where(eq(packOrders.id, id));
}
export async function markPaid(id: string) {
  // Only move forward: an order already paid, delivered or cancelled stays as it is.
  await db.update(packOrders).set({ status: "paid" }).where(and(eq(packOrders.id, id), inArray(packOrders.status, ["new", "confirmed"])));
}
export async function getOrders(): Promise<(PackOrder & { item: string; price: string })[]> {
  await connection();
  const rows = await db
    .select({ o: packOrders, item: packItems.title, price: packItems.price })
    .from(packOrders)
    .innerJoin(packItems, eq(packOrders.itemId, packItems.id))
    .orderBy(desc(packOrders.createdAt))
    .limit(200);
  return rows.map((r) => ({ ...r.o, item: r.item, price: r.price }));
}
export async function setOrderStatus(id: string, status: PackOrder["status"]) {
  await db.update(packOrders).set({ status }).where(eq(packOrders.id, id));
}

/** Deletes every seeded example (wall notes, shop items and their orders, giveaways and their entries). */
export async function removeSamples() {
  await db.delete(packPosts).where(eq(packPosts.sample, true));
  await db.delete(packItems).where(eq(packItems.sample, true));
  await db.delete(giveaways).where(eq(giveaways.sample, true));
}
export async function countSamples(): Promise<number> {
  const [a] = await db.select({ n: count() }).from(packPosts).where(eq(packPosts.sample, true));
  const [b] = await db.select({ n: count() }).from(packItems).where(eq(packItems.sample, true));
  const [c] = await db.select({ n: count() }).from(giveaways).where(eq(giveaways.sample, true));
  return a.n + b.n + c.n;
}

// Uploaded photos
export async function saveImage(mime: string, data: Buffer): Promise<string> {
  const [row] = await db.insert(packImages).values({ mime, data }).returning({ id: packImages.id });
  return row.id;
}
export async function getImage(id: string) {
  await connection();
  const [row] = await db.select().from(packImages).where(eq(packImages.id, id)).limit(1);
  return row;
}

export async function deleteItem(id: string) {
  // Orders for this item are removed with it (cascade); its photo stays unreferenced.
  await db.delete(packItems).where(eq(packItems.id, id));
}
