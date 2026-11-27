import { Suspense } from "react";
import { Closing } from "@/components/landing/closing";
import { Dock } from "@/components/landing/dock";
import { Hero } from "@/components/landing/hero";
import { LatestRelease } from "@/components/landing/latest-release";
import { Lines } from "@/components/landing/lines";
import { Music } from "@/components/landing/music";
import { Video } from "@/components/landing/video";
import { FollowForm } from "@/components/track-experience";
import { CATALOGUE } from "@/lib/catalogue";
import { getApprovedNotes, getTrack } from "@/lib/store";

const SLUG = "she-get";

const HERO_IMAGES = ["/img/herman.jpg", ...CATALOGUE.slice(0, 3).map((c) => c.art), "/img/herman.jpg", ...CATALOGUE.slice(3, 6).map((c) => c.art)];

const SOCIALS = [
  { label: "Spotify", href: "https://open.spotify.com/artist/795E5FXQUgbjuPBxk6igGm" },
  { label: "Apple Music", href: "https://music.apple.com/us/artist/herman-suede/1301306379" },
  { label: "YouTube", href: "https://www.youtube.com/HermanSuede" },
  { label: "Instagram", href: "https://www.instagram.com/hermansuede1/" },
  { label: "X", href: "https://x.com/hermansuede" },
  { label: "SoundCloud", href: "https://soundcloud.com/hermansuede" },
  { label: "Audiomack", href: "https://audiomack.com/hermansuede" },
];

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <Hero images={HERO_IMAGES} />
      <Suspense fallback={<div className="mx-auto my-24 h-[520px] w-full max-w-6xl animate-pulse rounded-[15px] bg-sunk" />}>
        <Release />
      </Suspense>
      <Music />
      <div className="pt-24" />
      <Lines />
      <Video />
      <section id="signup" className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:px-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Shows</p>
          <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(44px,6vw,80px)] leading-[0.95]">No dates yet.</h2>
          <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-ink/75">
            Tell us your city. When Herman plays near you, you hear first.
          </p>
        </div>
        <FollowForm slug={SLUG} momentT={null} artist="Herman Suede" />
      </section>
      <Closing />
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 pb-28 pt-10 text-[13px] text-muted-foreground md:px-8">
        <span>Herman Suede · Accra</span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              {s.label}
            </a>
          ))}
        </nav>
      </footer>
      <Dock />
    </main>
  );
}

async function Release() {
  const [track, notes] = await Promise.all([getTrack(SLUG), getApprovedNotes(SLUG)]);
  if (!track) return null;
  return <LatestRelease track={track} notes={notes} />;
}
