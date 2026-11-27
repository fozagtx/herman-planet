"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireTeam, startSession } from "@/lib/auth";
import { createNote, createTrack, getTrack, updateNote, updateTrack } from "@/lib/store";
import type { NoteKind, NoteStatus, ReleaseLink, Track } from "@/lib/types";

// Every action below changes data Herman's team owns, so each one checks the
// Studio session first. Server actions are reachable by direct POST.

export type FormState = { ok: boolean; message: string } | null;

const STATUSES: NoteStatus[] = ["draft", "in_review", "approved"];
const KINDS: NoteKind[] = ["sound", "lyrics", "production"];
const PLATFORMS = ["Spotify", "Apple Music", "YouTube"] as const;

function refresh(slug?: string) {
  revalidatePath("/studio");
  revalidatePath("/");
  if (slug) revalidatePath(`/t/${slug}`);
  revalidatePath("/t/[slug]", "page");
}

// --- Session ---

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const ok = await startSession(String(form.get("passcode") ?? "").trim());
  if (!ok) {
    // Slow down guessing: every wrong code costs time.
    await new Promise((r) => setTimeout(r, 1500));
    return { ok: false, message: "That access code didn't work. Check it with Herman's team." };
  }
  redirect("/studio");
}

export async function signOut() {
  await endSession();
  redirect("/studio");
}

// --- Notes ---

export async function setNoteStatus(form: FormData) {
  await requireTeam();
  const id = String(form.get("id"));
  const status = String(form.get("status")) as NoteStatus;
  if (!STATUSES.includes(status)) throw new Error("Bad status");
  await updateNote(
    id,
    status === "approved"
      ? { status, approvedBy: "Herman's team", approvedAt: new Date().toISOString().slice(0, 10) }
      : { status, approvedBy: null, approvedAt: null },
  );
  refresh();
}

export async function saveNote(form: FormData) {
  await requireTeam();
  const id = String(form.get("id") ?? "");
  const kind = String(form.get("kind")) as NoteKind;
  if (!KINDS.includes(kind)) throw new Error("Bad kind");
  const fields = {
    t: parseTime(String(form.get("t"))),
    kind,
    title: String(form.get("title") ?? "").trim().slice(0, 80),
    body: String(form.get("body") ?? "").trim().slice(0, 600),
    credits: lines(form.get("credits")),
    layers: String(form.get("layers") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    placeholder: false,
  };
  if (id) {
    // Any edit sends the note back to review: approval covers the exact words.
    await updateNote(id, { ...fields, status: "in_review", approvedBy: null, approvedAt: null });
  } else {
    await createNote({ ...fields, trackSlug: String(form.get("trackSlug")), status: "draft" });
  }
  refresh(String(form.get("trackSlug") ?? ""));
}

// --- Track details ---

export async function saveTrack(_prev: FormState, form: FormData): Promise<FormState> {
  await requireTeam();
  const slug = String(form.get("slug"));
  try {
    const credits = lines(form.get("credits")).map((l) => {
      const [role, ...rest] = l.split(":");
      if (!rest.length) throw new Error(`Write credits as "Role: Name". Check "${l}".`);
      return { role: role.trim(), name: rest.join(":").trim() };
    });
    const releases: ReleaseLink[] = PLATFORMS.map((platform) => {
      const href = url(form.get(`release-${platform}`), platform);
      return { platform, href };
    }).filter((r) => r.href);
    await updateTrack(slug, {
      title: text(form.get("title"), "Title", 80),
      year: text(form.get("year"), "Year", 4),
      duration: parseTime(String(form.get("duration"))),
      hookAt: parseTime(String(form.get("hookAt"))),
      spotifyTrackId: spotifyId(form.get("spotify")),
      artworkUrl: url(form.get("artwork"), "Cover image"),
      credits,
      releases,
    });
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  refresh(slug);
  return { ok: true, message: "Saved. The track page shows it now." };
}

export async function saveLiveUpdate(_prev: FormState, form: FormData): Promise<FormState> {
  await requireTeam();
  const slug = String(form.get("slug"));
  const title = String(form.get("title") ?? "").trim().slice(0, 80);
  const body = String(form.get("body") ?? "").trim().slice(0, 280);
  const approved = form.get("approved") === "on";
  if (approved && !title) return { ok: false, message: "Add a title before approving the update." };
  const liveUpdate: Track["liveUpdate"] = title || body ? { title, body, approved } : null;
  await updateTrack(slug, { liveUpdate });
  refresh(slug);
  return {
    ok: true,
    message: approved ? "Approved. Fans see this update now." : "Saved as a draft. Fans still see \"New dates, coming soon\".",
  };
}

export async function addTrack(_prev: FormState, form: FormData): Promise<FormState> {
  await requireTeam();
  let slug = "";
  try {
    const title = text(form.get("title"), "Title", 80);
    slug = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) throw new Error("Use a title with letters or numbers.");
    if (await getTrack(slug)) throw new Error(`A track at /t/${slug} already exists.`);
    await createTrack({
      slug,
      title,
      artist: "Herman Suede",
      year: text(form.get("year"), "Year", 4),
      duration: parseTime(String(form.get("duration"))),
      hookAt: 0,
      stems: [],
      credits: [{ role: "Artist", name: "Herman Suede" }],
      releases: [],
      related: [],
      liveUpdate: null,
      placeholderMedia: false,
      spotifyTrackId: spotifyId(form.get("spotify")),
      artworkUrl: url(form.get("artwork"), "Cover image"),
    });
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  refresh(slug);
  redirect(`/studio?track=${slug}`);
}

// --- Parsing ---

function parseTime(v: string): number {
  const m = v.trim().match(/^(\d+):(\d{1,2})$/);
  const n = m ? Number(m[1]) * 60 + Number(m[2]) : Number(v);
  if (!v.trim() || !Number.isFinite(n) || n < 0) throw new Error(`"${v}" isn't a time. Use m:ss, like 3:26.`);
  return Math.round(n);
}

function lines(v: FormDataEntryValue | null): string[] {
  return String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
}

function text(v: FormDataEntryValue | null, label: string, max: number): string {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`${label} is required.`);
  return s.slice(0, max);
}

function url(v: FormDataEntryValue | null, label: string): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") throw new Error();
    return u.toString();
  } catch {
    throw new Error(`${label} needs a full https:// link.`);
  }
}

/** Accepts a Spotify track link or a bare 22-character id. */
function spotifyId(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const m = s.match(/(?:track[/:])?([A-Za-z0-9]{22})(?:\?|$)/);
  if (!m) throw new Error("Paste the Spotify track link (open.spotify.com/track/...).");
  return m[1];
}
