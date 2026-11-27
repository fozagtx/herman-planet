import type { Metadata } from "next";
import { TrackPage, ogMeta } from "../../track-page";

const toT = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

export async function generateMetadata({ params }: PageProps<"/t/[slug]/m/[t]">): Promise<Metadata> {
  const p = await params;
  return ogMeta(p.slug, toT(p.t));
}

export default function Page({ params }: PageProps<"/t/[slug]/m/[t]">) {
  return <TrackPage slug={params.then((p) => p.slug)} startAt={params.then((p) => toT(p.t))} />;
}
