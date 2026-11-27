"use server";

import { revalidatePath } from "next/cache";
import { requireTeam } from "@/lib/auth";
import { bachs } from "@/lib/bachs";
import { deleteEvent, reserveTickets, saveEvent, setEventStatus, setTicketCheckout, setTicketStatus, type Event, type Ticket } from "@/lib/events";
import { saveImage } from "@/lib/pack";

export type EventState = { ok: boolean; message: string; redirect?: string } | null;

const refresh = () => {
  revalidatePath("/pack");
  revalidatePath("/");
  revalidatePath("/studio/pack");
};
const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);
const isContact = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || /^\+?[\d\s()-]{7,20}$/.test(s);

// --- Fans ---

export async function bookTickets(_p: EventState, f: FormData): Promise<EventState> {
  if (str(f.get("website"), 10)) return { ok: true, message: "Thanks." };
  const name = str(f.get("name"), 60);
  const contact = str(f.get("contact"), 80);
  const quantity = Math.min(10, Math.max(1, Number(f.get("quantity")) || 1));
  if (name.length < 2) return { ok: false, message: "Add your name." };
  if (!isContact(contact)) return { ok: false, message: "Add an email or phone number for your tickets." };
  if (f.get("consent") !== "on") return { ok: false, message: "Tick the box so the team can send your tickets." };

  const eventId = str(f.get("eventId"), 60);
  const free = f.get("free") === "1";
  const res = await reserveTickets({ eventId, name, contact, quantity, status: free ? "confirmed" : "new", sample: f.get("sample") === "1" });
  if (res === "closed") return { ok: false, message: "This event isn't taking bookings any more." };
  if (res === "full") return { ok: false, message: quantity > 1 ? "Not enough places left for that many. Try fewer." : "Sold out. Follow Herman for the next one." };
  refresh();

  if (free) return { ok: true, message: `You're on the list for ${quantity}. Herman's team will send details to ${contact}.` };

  const client = bachs();
  const { getEvent } = await import("@/lib/events");
  const event = (await getEvent(eventId))!;
  if (client && event.amount && !event.sample && f.get("pay") !== "contact") {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    try {
      const checkout = await client.checkoutSessions.create(
        {
          pricing: { currency: event.currency, amount: (Number(event.amount) * quantity).toFixed(2), price_type: "fixed" },
          ...(contact.includes("@") ? { customer: { email: contact, name } } : {}),
          reference: res.id,
          metadata: { kind: "ticket", ticket_id: res.id, event: event.title, quantity },
          success_url: `${site}/pack/ticket/${res.id}`,
          cancel_url: `${site}/pack#events`,
        },
        { idempotencyKey: `ticket-${res.id}` },
      );
      await setTicketCheckout(res.id, checkout.checkout_id);
      return { ok: true, message: "Taking you to secure checkout…", redirect: checkout.checkout_url };
    } catch (e) {
      console.error("Bachs checkout failed", (e as { errorCode?: string }).errorCode ?? e);
      return { ok: true, message: `Places held. Online payment isn't available right now, so Herman's team will contact you at ${contact}.` };
    }
  }
  return {
    ok: true,
    message: event.sample
      ? "Places held. This is a sample event, so nothing will be charged."
      : `Places held. Herman's team will contact you at ${contact} to pay and send your tickets.`,
  };
}

// --- Herman's team ---

export async function saveEventAction(_p: EventState, f: FormData): Promise<EventState> {
  await requireTeam();
  try {
    const kind = str(f.get("kind"), 10) as Event["kind"];
    if (!["show", "meetup"].includes(kind)) throw new Error("Pick a show or a meetup.");
    const title = str(f.get("title"), 80);
    const venue = str(f.get("venue"), 80);
    const city = str(f.get("city"), 40);
    const startsAt = new Date(String(f.get("startsAt") ?? ""));
    if (!title || !venue || !city) throw new Error("Add a title, venue and city.");
    if (Number.isNaN(startsAt.getTime())) throw new Error("Pick a date and time.");
    const amountRaw = str(f.get("amount"), 12);
    if (amountRaw && !/^\d+(\.\d{1,2})?$/.test(amountRaw)) throw new Error("Amount needs to be a number like 150 or 150.00.");
    const capRaw = str(f.get("capacity"), 6);
    let imageUrl: string | null = str(f.get("currentImage"), 500) || null;
    const photo = f.get("photo");
    if (photo instanceof File && photo.size > 0) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) throw new Error("Upload a JPG, PNG or WebP photo.");
      if (photo.size > 2_500_000) throw new Error("That photo is too large. Try one under 2.5 MB.");
      imageUrl = `/api/pack-image/${await saveImage(photo.type, Buffer.from(await photo.arrayBuffer()))}`;
    }
    await saveEvent(str(f.get("id"), 60) || null, {
      kind, title, venue, city, startsAt, imageUrl,
      details: str(f.get("details"), 400) || null,
      price: str(f.get("price"), 30) || null,
      amount: amountRaw ? Number(amountRaw).toFixed(2) : null,
      currency: str(f.get("currency"), 3).toUpperCase() || "GHS",
      capacity: capRaw ? Math.max(1, Number(capRaw) || 0) : null,
      status: f.get("live") === "on" ? "live" : "draft",
    });
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  refresh();
  return { ok: true, message: f.get("live") === "on" ? "Saved and live. Fans can book now." : "Saved as a draft." };
}

export async function eventStatus(f: FormData) {
  await requireTeam();
  await setEventStatus(String(f.get("id")), String(f.get("status")) as Event["status"]);
  refresh();
}

export async function removeEvent(f: FormData) {
  await requireTeam();
  await deleteEvent(String(f.get("id")));
  refresh();
}

export async function ticketStatus(f: FormData) {
  await requireTeam();
  await setTicketStatus(String(f.get("id")), String(f.get("status")) as Ticket["status"]);
  refresh();
}
