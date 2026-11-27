import type { Metadata } from "next";
import { TrackPage, ogMeta } from "./track-page";

export async function generateMetadata({ params }: PageProps<"/t/[slug]">): Promise<Metadata> {
  return ogMeta((await params).slug, null);
}

export default function Page({ params }: PageProps<"/t/[slug]">) {
  return <TrackPage slug={params.then((p) => p.slug)} startAt={Promise.resolve(null)} />;
}
