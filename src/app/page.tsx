import { Suspense } from "react";
import Link from "next/link";
import { Closing } from "@/components/landing/closing";
import { Dock } from "@/components/landing/dock";
import { HearTheHook } from "@/components/landing/hear-the-hook";
import { Hero } from "@/components/landing/hero";
import { Journey } from "@/components/landing/journey";
import { Moments } from "@/components/landing/moments";
import { momentCover, wordTile } from "@/lib/covers";
import { getApprovedNotes, getFollows, getTrack } from "@/lib/store";

const SLUG = "she-get";
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const KIND_LABEL = { sound: "Sound", lyrics: "Lyrics", production: "Production" } as const;

const HERO_IMAGES = [
  "/img/herman.jpg",
  wordTile("Hear it", "sound"),
  wordTile("Explore", "lyrics"),
  "/img/herman.jpg",
  wordTile("Listen", "production"),
  wordTile("Come back", "sound"),
];

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <Hero images={HERO_IMAGES} />
      <HearTheHook placeholder />
      <Journey />
      <section className="border-y border-line bg-surface/50 py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">02 · Explore</p>
          <h2 className="mt-3 max-w-2xl text-[clamp(32px,4.4vw,56px)] font-semibold leading-[0.98] tracking-[-0.04em]">
            Every marked moment, approved by Herman&apos;s team.
          </h2>
        </div>
        <Suspense fallback={<div className="mx-auto mt-10 h-[690px] max-w-6xl animate-pulse rounded-[15px] bg-sunk" />}>
          <MomentsData />
        </Suspense>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-24 md:grid-cols-2 md:px-8">
        <Suspense fallback={<div className="h-56 animate-pulse rounded-[15px] bg-sunk md:col-span-2" />}>
          <TeamCards />
        </Suspense>
      </section>
      <Closing />
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-3 px-6 pb-28 pt-8 text-[13px] text-muted-foreground md:px-8">
        <span>Behind the Hook · a prototype for Herman Suede</span>
        <span>Notes, media and links shown only once his team approves them.</span>
      </footer>
      <Dock />
    </main>
  );
}

async function MomentsData() {
  const notes = await getApprovedNotes(SLUG);
  return (
    <Moments
      moments={notes.map((n) => ({
        t: n.t,
        time: fmt(n.t),
        title: n.title,
        href: `/t/${SLUG}/m/${n.t}`,
        src: momentCover({ time: fmt(n.t), title: n.title, kind: n.kind, label: KIND_LABEL[n.kind] }),
      }))}
    />
  );
}

async function TeamCards() {
  const [track, notes, follows] = await Promise.all([getTrack(SLUG), getApprovedNotes(SLUG), getFollows()]);
  const cities = new Set(follows.map((f) => f.city)).size;
  const tickets = follows.filter((f) => f.ticketIntent).length;
  return (
    <>
      <Link href="/studio" className="surface block p-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">For Herman&apos;s team</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">Nothing goes live until you approve it.</h3>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Write a note at a timestamp, send it for review, approve it. Editing an approved note sends it back to review.
        </p>
        <p className="mt-6 text-sm">
          <span className="num font-semibold">{notes.length}</span> <span className="text-muted-foreground">approved notes live on {track?.title ?? "this track"}</span>
        </p>
      </Link>
      <Link href="/team" className="surface block p-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">For promoters</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">See which cities would buy a ticket.</h3>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Every follower opted in and named a city. Followers and ticket intent are counted separately.
        </p>
        <p className="mt-6 text-sm">
          <span className="num font-semibold">{follows.length}</span> <span className="text-muted-foreground">followers</span>
          {" · "}
          <span className="num font-semibold">{tickets}</span> <span className="text-muted-foreground">would buy</span>
          {" · "}
          <span className="num font-semibold">{cities}</span> <span className="text-muted-foreground">cities</span>
        </p>
      </Link>
    </>
  );
}
