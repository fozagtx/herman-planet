import "server-only";
import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db, eventTickets, events } from "@/db";

export type Event = typeof events.$inferSelect;
export type Ticket = typeof eventTickets.$inferSelect;
export type EventWithSales = Event & { sold: number };

/** Tickets that hold a place: everything except cancelled. */
const HOLDING = ["new", "confirmed", "paid", "fulfilled"] as const;

const soldFor = (id: Event["id"]) =>
  db
    .select({ n: sql<number>`coalesce(sum(${eventTickets.quantity}), 0)::int` })
    .from(eventTickets)
    .where(and(eq(eventTickets.eventId, id), inArray(eventTickets.status, [...HOLDING])));

/** Upcoming live events, soonest first, with places taken. */
export async function getUpcomingEvents(): Promise<EventWithSales[]> {
  await connection();
  const rows = await db.select().from(events).where(and(eq(events.status, "live"), gt(events.startsAt, new Date()))).orderBy(asc(events.startsAt));
  return Promise.all(rows.map(async (e) => ({ ...e, sold: (await soldFor(e.id))[0].n })));
}

export async function getAllEvents(): Promise<(EventWithSales & { tickets: Ticket[] })[]> {
  await connection();
  const rows = await db.select().from(events).orderBy(desc(events.startsAt));
  return Promise.all(
    rows.map(async (e) => ({
      ...e,
      sold: (await soldFor(e.id))[0].n,
      tickets: await db.select().from(eventTickets).where(eq(eventTickets.eventId, e.id)).orderBy(desc(eventTickets.createdAt)),
    })),
  );
}

export async function saveEvent(id: string | null, v: Omit<typeof events.$inferInsert, "id" | "createdAt">) {
  if (id) await db.update(events).set(v).where(eq(events.id, id));
  else await db.insert(events).values(v);
}
export async function setEventStatus(id: string, status: Event["status"]) {
  await db.update(events).set({ status }).where(eq(events.id, id));
}
export async function deleteEvent(id: string) {
  await db.delete(events).where(eq(events.id, id));
}
export async function getEvent(id: string) {
  const [e] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return e;
}

/**
 * Reserves tickets if there's room. Locks the event row so two fans can't take the last place
 * at once. Returns the ticket, or a reason it couldn't be booked.
 */
export async function reserveTickets(t: { eventId: string; name: string; contact: string; quantity: number; status: Ticket["status"]; sample: boolean }): Promise<Ticket | "full" | "closed"> {
  return db.transaction(async (tx) => {
    const [e] = await tx.select().from(events).where(eq(events.id, t.eventId)).for("update");
    if (!e || e.status !== "live" || e.startsAt <= new Date()) return "closed";
    if (e.capacity) {
      const [{ n }] = await tx
        .select({ n: sql<number>`coalesce(sum(${eventTickets.quantity}), 0)::int` })
        .from(eventTickets)
        .where(and(eq(eventTickets.eventId, e.id), inArray(eventTickets.status, [...HOLDING])));
      if (n + t.quantity > e.capacity) return "full";
    }
    const [row] = await tx.insert(eventTickets).values(t).returning();
    return row;
  });
}

export async function getTicket(id: string): Promise<(Ticket & { event: Event }) | undefined> {
  const [r] = await db.select({ t: eventTickets, e: events }).from(eventTickets).innerJoin(events, eq(eventTickets.eventId, events.id)).where(eq(eventTickets.id, id)).limit(1);
  return r ? { ...r.t, event: r.e } : undefined;
}
export async function setTicketCheckout(id: string, checkoutId: string) {
  await db.update(eventTickets).set({ checkoutId }).where(eq(eventTickets.id, id));
}
export async function markTicketPaid(id: string) {
  await db.update(eventTickets).set({ status: "paid" }).where(and(eq(eventTickets.id, id), inArray(eventTickets.status, ["new", "confirmed"])));
}
export async function setTicketStatus(id: string, status: Ticket["status"]) {
  await db.update(eventTickets).set({ status }).where(eq(eventTickets.id, id));
}
