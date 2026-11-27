"use server";

import { revalidatePath } from "next/cache";
import { addFollow, createNote, updateNote } from "@/lib/store";
import type { NoteKind, NoteStatus } from "@/lib/types";

export type FollowState = { ok: boolean; message: string } | null;

export async function followAction(_prev: FollowState, form: FormData): Promise<FollowState> {
  const contact = String(form.get("contact") ?? "").trim();
  const city = String(form.get("city") ?? "").trim();
  const trackSlug = String(form.get("trackSlug") ?? "");
  const momentRaw = form.get("momentT");
  const consent = form.get("consent") === "on";

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^\+?[\d\s()-]{7,20}$/.test(contact);
  if (!isEmail && !isPhone) return { ok: false, message: "Enter an email or phone number." };
  if (city.length < 2 || city.length > 60) return { ok: false, message: "Tell us your city." };
  if (!consent) return { ok: false, message: "Tick the box so Herman's team can message you." };

  await addFollow({
    trackSlug,
    momentT: momentRaw ? Number(momentRaw) || null : null,
    contact,
    city: normaliseCity(city),
    ticketIntent: form.get("ticketIntent") === "on",
    consent,
  });
  revalidatePath("/team");
  return { ok: true, message: `${normaliseCity(city)} is on Herman's map. Only news his team signs off will reach you.` };
}

function normaliseCity(c: string) {
  return c
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s-])\p{L}/gu, (m) => m.toUpperCase());
}

// --- Studio (team-only in a real deploy; no auth in this prototype) ---

const STATUSES: NoteStatus[] = ["draft", "in_review", "approved"];
const KINDS: NoteKind[] = ["sound", "lyrics", "production"];

export async function setNoteStatus(form: FormData) {
  const id = String(form.get("id"));
  const status = String(form.get("status")) as NoteStatus;
  if (!STATUSES.includes(status)) throw new Error("Bad status");
  await updateNote(
    id,
    status === "approved"
      ? { status, approvedBy: "Herman's team", approvedAt: new Date().toISOString().slice(0, 10) }
      : { status, approvedBy: null, approvedAt: null },
  );
  revalidatePath("/studio");
  revalidatePath("/t/[slug]", "page");
}

export async function saveNote(form: FormData) {
  const id = String(form.get("id") ?? "");
  const kind = String(form.get("kind")) as NoteKind;
  if (!KINDS.includes(kind)) throw new Error("Bad kind");
  const t = parseTime(String(form.get("t")));
  const fields = {
    t,
    kind,
    title: String(form.get("title") ?? "").trim().slice(0, 80),
    body: String(form.get("body") ?? "").trim().slice(0, 600),
    credits: String(form.get("credits") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    layers: String(form.get("layers") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    placeholder: false,
  };
  if (id) {
    // Any edit sends the note back to review: approval covers the exact words.
    await updateNote(id, { ...fields, status: "in_review", approvedBy: null, approvedAt: null });
  } else {
    await createNote({ ...fields, trackSlug: String(form.get("trackSlug")), status: "draft" });
  }
  revalidatePath("/studio");
  revalidatePath("/t/[slug]", "page");
}

function parseTime(v: string): number {
  const m = v.trim().match(/^(\d+):(\d{1,2})$/);
  const n = m ? Number(m[1]) * 60 + Number(m[2]) : Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error("Bad time");
  return Math.round(n);
}
