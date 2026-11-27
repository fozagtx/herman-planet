"use server";

import { revalidatePath } from "next/cache";
import { requireTeam } from "@/lib/auth";
import {
  addEntry, addPost, drawWinner, saveGiveaway, saveItem, setGiveawayStatus, setItemStatus, setPackName, setPostStatus,
  type PackItem, type PackPost, type Giveaway,
} from "@/lib/pack";

export type PackState = { ok: boolean; message: string } | null;

const refresh = () => {
  revalidatePath("/pack");
  revalidatePath("/");
  revalidatePath("/studio/pack");
};
const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);
const isContact = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || /^\+?[\d\s()-]{7,20}$/.test(s);

// --- Fans (public) ---

export async function joinWall(_p: PackState, f: FormData): Promise<PackState> {
  if (str(f.get("website"), 10)) return { ok: true, message: "Thanks." }; // spam trap
  const name = str(f.get("name"), 40);
  const message = str(f.get("message"), 220);
  if (name.length < 2) return { ok: false, message: "Add your name or handle." };
  if (message.length < 3) return { ok: false, message: "Write a few words for Herman." };
  if (f.get("consent") !== "on") return { ok: false, message: "Tick the box so the team can show your note." };
  await addPost({ name, city: str(f.get("city"), 40) || null, message, song: str(f.get("song"), 60) || null, consent: true });
  return { ok: true, message: "Sent. Herman's team reads the wall and features notes they love." };
}

export async function enterGiveaway(_p: PackState, f: FormData): Promise<PackState> {
  if (str(f.get("website"), 10)) return { ok: true, message: "Thanks." };
  const giveawayId = str(f.get("giveawayId"), 60);
  const name = str(f.get("name"), 60);
  const contact = str(f.get("contact"), 80);
  if (name.length < 2) return { ok: false, message: "Add your name." };
  if (!isContact(contact)) return { ok: false, message: "Add an email or phone number so the team can reach you if you win." };
  if (f.get("consent") !== "on") return { ok: false, message: "Tick the box so the team can contact you if you win." };
  const fresh = await addEntry({ giveawayId, name, contact, city: str(f.get("city"), 40) || null, consent: true });
  refresh();
  return fresh ? { ok: true, message: "You're in. Good luck." } : { ok: true, message: "You're already in this one. Good luck." };
}

// --- Herman's team (Studio) ---

export async function savePackName(_p: PackState, f: FormData): Promise<PackState> {
  await requireTeam();
  const name = str(f.get("name"), 40);
  if (name.length < 2) return { ok: false, message: "Give the pack a name." };
  await setPackName(name);
  refresh();
  return { ok: true, message: `Saved. The site now says ${name}.` };
}

export async function moderatePost(f: FormData) {
  await requireTeam();
  await setPostStatus(String(f.get("id")), String(f.get("status")) as PackPost["status"]);
  refresh();
}

export async function saveShopItem(_p: PackState, f: FormData): Promise<PackState> {
  await requireTeam();
  const id = str(f.get("id"), 60) || null;
  const kind = str(f.get("kind"), 20) as PackItem["kind"];
  const url = (v: string, label: string, required = false) => {
    if (!v) { if (required) throw new Error(`${label} is required.`); return null; }
    const u = new URL(v);
    if (u.protocol !== "https:") throw new Error(`${label} needs a full https:// link.`);
    return u.toString();
  };
  try {
    if (!["merch", "unreleased"].includes(kind)) throw new Error("Pick merch or unreleased music.");
    const title = str(f.get("title"), 80);
    const price = str(f.get("price"), 30);
    if (!title) throw new Error("Add a title.");
    if (!price) throw new Error("Add a price, e.g. GH₵ 250.");
    await saveItem(id, {
      kind, title, price,
      description: str(f.get("description"), 280) || null,
      imageUrl: url(str(f.get("image"), 500), "Image link"),
      previewUrl: url(str(f.get("preview"), 500), "Snippet link"),
      buyUrl: url(str(f.get("buy"), 500), "Checkout link", true)!,
      status: f.get("live") === "on" ? "live" : "draft",
    });
  } catch (e) {
    return { ok: false, message: e instanceof TypeError ? "Check the links: each needs to be a full https:// address." : (e as Error).message };
  }
  refresh();
  return { ok: true, message: f.get("live") === "on" ? "Saved and live in the Pack shop." : "Saved as a draft." };
}

export async function toggleItem(f: FormData) {
  await requireTeam();
  await setItemStatus(String(f.get("id")), String(f.get("status")) as PackItem["status"]);
  refresh();
}

export async function saveGiveawayAction(_p: PackState, f: FormData): Promise<PackState> {
  await requireTeam();
  const title = str(f.get("title"), 80);
  const prize = str(f.get("prize"), 120);
  const ends = new Date(String(f.get("endsAt") ?? ""));
  if (!title || !prize) return { ok: false, message: "Add a title and the prize." };
  if (Number.isNaN(ends.getTime()) || ends.getTime() < Date.now()) return { ok: false, message: "Pick an end date in the future." };
  await saveGiveaway(str(f.get("id"), 60) || null, {
    title, prize, details: str(f.get("details"), 400) || null, endsAt: ends,
    status: (f.get("live") === "on" ? "live" : "draft") as Giveaway["status"],
  });
  refresh();
  return { ok: true, message: f.get("live") === "on" ? "Live. Fans can enter now." : "Saved as a draft." };
}

export async function giveawayStatus(f: FormData) {
  await requireTeam();
  await setGiveawayStatus(String(f.get("id")), String(f.get("status")) as Giveaway["status"]);
  refresh();
}

export async function pickWinner(_p: PackState, f: FormData): Promise<PackState> {
  await requireTeam();
  const who = await drawWinner(String(f.get("id")));
  refresh();
  return who ? { ok: true, message: `Winner: ${who}. The site shows their first name and city only.` } : { ok: false, message: "No entries yet." };
}
