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
    <Suspense fallback={<div className="min-h-svh bg-ink" />}>
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
