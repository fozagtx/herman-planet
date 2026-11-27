import { Suspense } from "react";
import Link from "next/link";
import { saveNote, setNoteStatus } from "@/app/actions";
import { getAllNotes, getTracks } from "@/lib/store";
import type { Note, NoteStatus } from "@/lib/types";

export const metadata = { title: "Studio · Behind the Hook" };

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const PILL: Record<NoteStatus, string> = {
  draft: "bg-sunk text-muted-foreground",
  in_review: "bg-ink/8 text-ink",
  approved: "bg-ink text-[#edff00]",
};
const LABEL: Record<NoteStatus, string> = { draft: "Draft", in_review: "In review", approved: "Approved · live" };

export default function Studio() {
  return (
    <div className="min-h-svh bg-paper px-5 py-8 text-ink">
      <div className="mx-auto max-w-3xl">
        <Header />
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading notes…</p>}>
          <Notes />
        </Suspense>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Herman&apos;s team</p>
        <h1 className="text-3xl font-semibold tracking-tight">Studio: timed notes</h1>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          Fans only ever see notes marked <b>Approved</b>. Editing an approved note sends it back to review, because approval covers the exact words.
        </p>
      </div>
      <nav className="flex gap-2 text-sm font-semibold">
        <Link href="/t/she-get" className="rounded-full border border-line px-4 py-2">Fan page ↗</Link>
        <Link href="/team" className="rounded-full bg-ink px-4 py-2 text-surface">Demand</Link>
      </nav>
    </header>
  );
}

async function Notes() {
  const [all, tracks] = await Promise.all([getAllNotes(), getTracks()]);
  const featured = tracks.find((t) => t.slug === "she-get") ?? tracks[0];
  const notes = all.filter((n) => n.trackSlug === featured?.slug);
  return (
    <>
      <ul className="mt-8 space-y-3">
        {notes.map((n) => <NoteRow key={n.id} n={n} />)}
      </ul>
      <details className="mt-6 surface p-5">
        <summary className="cursor-pointer font-bold">+ New note</summary>
        <NoteForm trackSlug={featured?.slug ?? ""} />
      </details>
    </>
  );
}

function NoteRow({ n }: { n: Note }) {
  const next: { to: NoteStatus; label: string }[] =
    n.status === "draft" ? [{ to: "in_review", label: "Send for review" }]
    : n.status === "in_review" ? [{ to: "approved", label: "Approve" }, { to: "draft", label: "Back to draft" }]
    : [{ to: "draft", label: "Unpublish" }];
  return (
    <li className="surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">{fmt(n.t)}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{n.kind}</span>
        <span className="flex-1 font-semibold">{n.title}</span>
        {n.placeholder && <span className="rounded-full bg-sunk px-2 py-0.5 text-xs font-medium text-muted-foreground">Placeholder</span>}
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${PILL[n.status]}`}>{LABEL[n.status]}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{n.body}</p>
      {n.approvedBy && <p className="mt-1 text-xs text-muted-foreground">Approved by {n.approvedBy} · {n.approvedAt}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {next.map((x) => (
          <form key={x.to} action={setNoteStatus}>
            <input type="hidden" name="id" value={n.id} />
            <input type="hidden" name="status" value={x.to} />
            <button className={`rounded-full px-3 py-1.5 text-sm font-semibold ${x.to === "approved" ? "bg-ink text-surface" : "border border-line"}`}>
              {x.label}
            </button>
          </form>
        ))}
        <details className="w-full">
          <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">Edit</summary>
          <NoteForm note={n} trackSlug={n.trackSlug} />
        </details>
      </div>
    </li>
  );
}

function NoteForm({ note, trackSlug }: { note?: Note; trackSlug: string }) {
  const field = "w-full rounded-lg border border-line bg-sunk/60 px-3 py-2 text-sm";
  return (
    <form action={saveNote} className="mt-3 grid gap-2">
      <input type="hidden" name="id" value={note?.id ?? ""} />
      <input type="hidden" name="trackSlug" value={trackSlug} />
      <div className="grid grid-cols-[90px_1fr] gap-2">
        <input name="t" required defaultValue={note ? fmt(note.t) : ""} placeholder="0:42" className={field} />
        <select name="kind" defaultValue={note?.kind ?? "production"} className={field}>
          <option value="sound">Sound</option>
          <option value="lyrics">Lyrics</option>
          <option value="production">Production</option>
        </select>
      </div>
      <input name="title" required maxLength={80} defaultValue={note?.title} placeholder="Title (6 words or fewer)" className={field} />
      <textarea name="body" required maxLength={600} rows={3} defaultValue={note?.body} placeholder="2 to 4 sentences, in Herman's words" className={field} />
      <textarea name="credits" rows={2} defaultValue={note?.credits.join("\n")} placeholder="Credits, one per line" className={field} />
      <input name="layers" defaultValue={note?.layers?.join(", ")} placeholder="Stems to solo, e.g. vocals or drums, bass" className={field} />
      <button className="justify-self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface">
        {note ? "Save (goes to review)" : "Save as draft"}
      </button>
    </form>
  );
}
