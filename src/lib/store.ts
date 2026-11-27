import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db, follows, notes, tracks } from "@/db";
import type { Follow, Note, Track } from "./types";

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
  return row;
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

export async function getFollows(): Promise<Follow[]> {
  await connection();
  const rows = await db.select().from(follows).orderBy(asc(follows.createdAt));
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export async function addFollow(f: Omit<Follow, "id" | "createdAt">) {
  await db.insert(follows).values(f);
}

export async function updateNote(id: string, patch: Partial<Omit<typeof notes.$inferInsert, "id">>) {
  const res = await db.update(notes).set(patch).where(eq(notes.id, id)).returning({ id: notes.id });
  if (res.length === 0) throw new Error("Note not found");
}

export async function createNote(n: Omit<Note, "id">) {
  await db.insert(notes).values({ ...n, id: `n-${crypto.randomUUID().slice(0, 8)}` });
}
