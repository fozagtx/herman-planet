import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TrackExperience } from "@/components/track-experience";
import { getApprovedNotes, getTrack } from "@/lib/store";

async function TrackLoader({ slug, startAt }: { slug: Promise<string>; startAt: Promise<number | null> }) {
  const s = await slug;
  const [track, notes, t] = await Promise.all([getTrack(s), getApprovedNotes(s), startAt]);
  if (!track) notFound();
  return <TrackExperience track={track} notes={notes} startAt={t} />;
}

export function TrackPage(props: { slug: Promise<string>; startAt: Promise<number | null> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid max-w-6xl gap-8 px-5 pt-16 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-14 md:px-8" aria-busy="true" aria-label="Loading track">
          <div className="space-y-4">
            <div className="aspect-square w-28 animate-pulse rounded-[15px] bg-sunk md:w-full" />
            <div className="h-9 w-40 animate-pulse rounded-lg bg-sunk" />
            <div className="h-12 w-44 animate-pulse rounded-full bg-sunk" />
          </div>
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-sunk" />
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-[15px] bg-sunk" />)}
          </div>
        </div>
      }
    >
      <TrackLoader {...props} />
    </Suspense>
  );
}

export function ogMeta(slug: string, t: number | null) {
  const at = t == null ? "" : ` · from ${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  return {
    title: `Herman Suede · Behind the Hook${at}`,
    description: "Hear it, see what's happening in the song, then listen in full.",
  };
}
