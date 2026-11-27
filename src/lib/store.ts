import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db, notes, tracks } from "@/db";
import { releaseBySlug, trackFromRelease } from "./catalogue";
import type { Note, Track } from "./types";

type NoteRow = typeof notes.$inferSelect;

function toNote(r: NoteRow): Note {
  return {
    ...r,
    layers: r.layers ?? undefined,
    approvedBy: r.approvedBy ?? undefined,
    approvedAt: r.approvedAt ?? undefined,
  };
}

export async function getTracks(): Promise<Track[]> {
  await connection();
  return db.select().from(tracks).orderBy(asc(tracks.title));
}

export async function getTrack(slug: string): Promise<Track | undefined> {
  await connection();
  const [row] = await db.select().from(tracks).where(eq(tracks.slug, slug)).limit(1);
  if (row) {
    // Keep the published story alongside the team's own data.
    const r = releaseBySlug(slug);
    return r?.story ? { ...row, story: { text: r.story, madeBy: r.madeBy, source: r.source } } : row;
  }
  const r = releaseBySlug(slug);
  return r ? trackFromRelease(r) : undefined;
}

/** Fan-facing: only approved notes ever leave this function. */
export async function getApprovedNotes(slug: string): Promise<Note[]> {
  await connection();
  const rows = await db
    .select()
    .from(notes)
    .where(and(eq(notes.trackSlug, slug), eq(notes.status, "approved")))
    .orderBy(asc(notes.t));
  return rows.map(toNote);
}

/** Team-facing: every note, any status. */
export async function getAllNotes(): Promise<Note[]> {
  await connection();
  const rows = await db.select().from(notes).orderBy(asc(notes.trackSlug), asc(notes.t));
  return rows.map(toNote);
}

export async function updateNote(id: string, patch: Partial<Omit<typeof notes.$inferInsert, "id">>) {
  const res = await db.update(notes).set(patch).where(eq(notes.id, id)).returning({ id: notes.id });
  if (res.length === 0) throw new Error("Note not found");
}

export async function createNote(n: Omit<Note, "id">) {
  await db.insert(notes).values({ ...n, id: `n-${crypto.randomUUID().slice(0, 8)}` });
}

export async function updateTrack(slug: string, patch: Partial<Omit<typeof tracks.$inferInsert, "slug">>) {
  const res = await db.update(tracks).set(patch).where(eq(tracks.slug, slug)).returning({ slug: tracks.slug });
  if (res.length === 0) throw new Error("Track not found");
}

export async function createTrack(row: typeof tracks.$inferInsert) {
  await db.insert(tracks).values(row);
}
