import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { saveNote, setNoteStatus, signOut } from "@/app/actions";
import { isTeam } from "@/lib/auth";
import { getAllNotes, getTracks } from "@/lib/store";
import type { Note, NoteStatus } from "@/lib/types";
import { IslandSubmit, LiveUpdateForm, NewTrackForm, SignInForm, TrackForm, fieldCls } from "./forms";

export const metadata = { title: "Studio · Behind the Hook", robots: { index: false } };

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const PILL: Record<NoteStatus, string> = {
  draft: "bg-sunk text-muted-foreground",
  in_review: "bg-ink/10 text-ink",
  approved: "bg-ink text-[#edff00]",
};
const LABEL: Record<NoteStatus, string> = { draft: "Draft", in_review: "In review", approved: "Live" };

export default function Studio({ searchParams }: PageProps<"/studio">) {
  return (
    <div className="min-h-svh bg-paper px-5 pb-24 pt-6 text-ink md:pt-10">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<StudioSkeleton />}>
          <Gate track={searchParams.then((p) => (typeof p.track === "string" ? p.track : undefined))} />
        </Suspense>
      </div>
    </div>
  );
}

function StudioSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading Studio">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-sunk" />
      <div className="h-12 animate-pulse rounded-full bg-sunk" />
      <div className="h-64 animate-pulse rounded-[15px] bg-sunk" />
    </div>
  );
}

async function Gate({ track }: { track: Promise<string | undefined> }) {
  if (!(await isTeam())) return <SignInForm />;
  const [slug, tracks, notes] = await Promise.all([track, getTracks(), getAllNotes()]);
  const current = tracks.find((t) => t.slug === slug) ?? tracks.find((t) => t.slug === "she-get") ?? tracks[0];
  const trackNotes = notes.filter((n) => n.trackSlug === current?.slug);
  const live = trackNotes.filter((n) => n.status === "approved").length;

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Herman&apos;s team</p>
          <h1 className="text-[28px] font-semibold tracking-tight md:text-3xl">Studio</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">Everything fans see on the site comes from here. Nothing goes live until you approve it.</p>
        </div>
        <form action={signOut}>
          <button className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-ink/30">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </form>
      </header>

      {/* Track switcher */}
      <nav aria-label="Tracks" className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1">
        {tracks.map((t) => (
          <Link key={t.slug} href={`/studio?track=${t.slug}`} aria-current={t.slug === current?.slug ? "page" : undefined}
            className={`press inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium ${t.slug === current?.slug ? "bg-ink text-surface" : "border border-line bg-surface hover:border-ink/30"}`}>
            {t.title}
          </Link>
        ))}
        <a href="#new-track" className="press inline-flex min-h-11 shrink-0 items-center rounded-full border border-dashed border-line px-4 text-sm font-medium text-muted-foreground hover:text-ink">
          + Add a track
        </a>
      </nav>

      {current && (
        <>
          <div className="surface mt-4 flex items-center gap-4 p-3">
            {current.artworkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.artworkUrl} alt="" className="h-16 w-16 rounded-[11px] object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-[11px] bg-sunk" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold tracking-tight">{current.title}</p>
              <p className="text-[13px] text-muted-foreground">
                <span className="num">{live}</span> notes live · <span className="num">{trackNotes.length - live}</span> waiting
              </p>
            </div>
            <Link href={`/t/${current.slug}`} className="press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-ink/30">
              View <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <Panel title="Timed notes" hint="Approve a note to put it on the track page. Editing a live note sends it back to review.">
            {trackNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet. Add the first one below: pick a second in the song and say what happens there.</p>
            ) : (
              <ul className="space-y-3">{trackNotes.map((n) => <NoteRow key={n.id} n={n} />)}</ul>
            )}
            <details className="mt-4 rounded-[13px] border border-line p-4">
              <summary className="cursor-pointer text-sm font-medium">+ New note</summary>
              <NoteForm trackSlug={current.slug} />
            </details>
          </Panel>

          <Panel title="Live update" hint="Shows in the Live card on the site. Leave unapproved and fans see “New dates, coming soon.”">
            <LiveUpdateForm key={`live-${current.slug}`} track={current} />
          </Panel>

          <Panel title="Track details" hint="Title, links and credits on the track page.">
            <TrackForm key={`track-${current.slug}`} track={current} />
          </Panel>
        </>
      )}

      <div id="new-track">
        <Panel title="Add a track" hint="It goes live at /t/<title>. Add notes next.">
          <NewTrackForm />
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="surface mt-6 p-5 md:p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">{hint}</p>
      {children}
    </section>
  );
}

function NoteRow({ n }: { n: Note }) {
  const next: { to: NoteStatus; label: string }[] =
    n.status === "draft" ? [{ to: "in_review", label: "Send for review" }]
    : n.status === "in_review" ? [{ to: "approved", label: "Approve" }, { to: "draft", label: "Back to draft" }]
    : [{ to: "draft", label: "Unpublish" }];
  return (
    <li className="rounded-[13px] border border-line bg-paper/60 p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="num text-sm text-muted-foreground">{fmt(n.t)}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{n.kind}</span>
        <span className="min-w-0 flex-1 font-medium">{n.title}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PILL[n.status]}`}>{LABEL[n.status]}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink/75">{n.body}</p>
      {n.placeholder && <p className="mt-1 text-xs text-muted-foreground">Drafted from release coverage. Rewrite in Herman&apos;s words before approving.</p>}
      {n.approvedBy && <p className="mt-1 text-xs text-muted-foreground">Approved by {n.approvedBy} · {n.approvedAt}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {next.map((x) => (
          <form key={x.to} action={setNoteStatus}>
            <input type="hidden" name="id" value={n.id} />
            <input type="hidden" name="status" value={x.to} />
            <IslandSubmit what={n.title} done={x.to === "approved" ? "Live" : "Saved"}
              className={`press inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium ${x.to === "approved" ? "bg-ink text-surface hover:bg-ink/85" : "border border-line bg-surface hover:border-ink/30"}`}>
              {x.label}
            </IslandSubmit>
          </form>
        ))}
        <details className="w-full">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-muted-foreground hover:text-ink">Edit</summary>
          <NoteForm note={n} trackSlug={n.trackSlug} />
        </details>
      </div>
    </li>
  );
}

function NoteForm({ note, trackSlug }: { note?: Note; trackSlug: string }) {
  const label = "grid gap-1.5 text-[13px] font-medium text-muted-foreground";
  return (
    <form action={saveNote} className="mt-3 grid gap-3">
      <input type="hidden" name="id" value={note?.id ?? ""} />
      <input type="hidden" name="trackSlug" value={trackSlug} />
      <div className="grid grid-cols-[100px_1fr] gap-3">
        <label className={label}>At<input name="t" required defaultValue={note ? fmt(note.t) : ""} placeholder="0:42" className={fieldCls} /></label>
        <label className={label}>
          Kind
          <select name="kind" defaultValue={note?.kind ?? "production"} className={fieldCls}>
            <option value="sound">Sound</option>
            <option value="lyrics">Lyrics</option>
            <option value="production">Production</option>
          </select>
        </label>
      </div>
      <label className={label}>Title (6 words or fewer)<input name="title" required maxLength={80} defaultValue={note?.title} className={fieldCls} /></label>
      <label className={label}>Note (2 to 4 sentences, in Herman&apos;s words)<textarea name="body" required maxLength={600} rows={3} defaultValue={note?.body} className={fieldCls} /></label>
      <label className={label}>Credits, one per line<textarea name="credits" rows={2} defaultValue={note?.credits.join("\n")} className={fieldCls} /></label>
      <div className="justify-self-start">
        <IslandSubmit what={note ? note.title : "New note"} className="press inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">
          {note ? "Save (goes to review)" : "Save as draft"}
        </IslandSubmit>
      </div>
    </form>
  );
}
