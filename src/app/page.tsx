import { Suspense } from "react";
import { Closing } from "@/components/landing/closing";
import { Dock } from "@/components/landing/dock";
import { Hero } from "@/components/landing/hero";
import { LatestRelease } from "@/components/landing/latest-release";
import { Lines } from "@/components/landing/lines";
import { Music } from "@/components/landing/music";
import { Video } from "@/components/landing/video";
import { Follow } from "@/components/follow";
import { Bio } from "@/components/landing/bio";
import { Since } from "@/components/landing/since";
import { Stats } from "@/components/landing/stats";
import { CATALOGUE } from "@/lib/catalogue";
import { PLATFORMS } from "@/lib/platforms";
import { getApprovedNotes, getTrack } from "@/lib/store";

const SLUG = "she-get";

const SHE_GET = CATALOGUE[0];
const HERO_ITEMS = [
  { src: "/img/herman.jpg", title: "She Get", preview: SHE_GET.preview, href: SHE_GET.spotify ?? SHE_GET.apple },
  ...CATALOGUE.slice(0, 4),
  { src: "/img/herman.jpg", title: "She Get", preview: SHE_GET.preview, href: SHE_GET.spotify ?? SHE_GET.apple },
  ...CATALOGUE.slice(4),
].map((c) => ("art" in c ? { src: c.art, title: c.title, preview: c.preview, href: c.spotify ?? c.apple } : c));


export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <Hero items={HERO_ITEMS} />
      <Suspense fallback={<div className="mx-auto my-24 h-[520px] w-full max-w-6xl animate-pulse rounded-[15px] bg-sunk" />}>
        <Release />
      </Suspense>
      <Music />
      <div className="px-6 md:px-8">
        <Stats />
      </div>
      <Bio />
      <Lines />
      <Since />
      <Video />
      <Suspense fallback={null}>
        <FollowData />
      </Suspense>
      <Closing />
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 pb-28 pt-10 text-[13px] text-muted-foreground md:px-8">
        <span>Herman Suede · Accra</span>
        <nav aria-label="Herman Suede elsewhere" className="flex flex-wrap gap-1">
          {PLATFORMS.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-sunk hover:text-ink">
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </nav>
      </footer>
      <Dock />
    </main>
  );
}

async function FollowData() {
  const track = await getTrack(SLUG);
  return <Follow liveUpdate={track?.liveUpdate} />;
}

async function Release() {
  const [track, notes] = await Promise.all([getTrack(SLUG), getApprovedNotes(SLUG)]);
  if (!track) return null;
  return <LatestRelease track={track} notes={notes} />;
}
