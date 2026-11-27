import { SiSpotify, SiYoutube } from "react-icons/si";
import { Reveal } from "@/components/reveal";

const VIDEO = "https://www.youtube.com/watch?v=SZ3F2IVGOZ0";
const TRACK = "https://open.spotify.com/track/0mfwWliY4X4TlfOHGJ3gru";

export function Video() {
  return (
    <section id="video" className="mx-auto w-full max-w-6xl px-6 py-14 md:px-8 md:py-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Video</p>
          <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(44px,6vw,80px)] leading-[0.95]">One by One</h2>
        </div>
        <p className="max-w-xs text-[15px] text-muted-foreground">His most played song: 553,954 plays on Spotify. Directed by Abass, produced by S.Kool Beatz.</p>
      </Reveal>
      <Reveal delay={0.08} className="surface mt-6 overflow-hidden p-1.5 md:mt-8 md:p-2">
        <div className="aspect-video overflow-hidden rounded-[11px] bg-ink md:rounded-[13px]">
          <iframe
            className="h-full w-full"
            src="https://www.youtube-nocookie.com/embed/SZ3F2IVGOZ0?rel=0"
            title="Herman Suede - One By One (Official Music Video)"
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Reveal>
      <Reveal delay={0.12} className="mt-5 flex flex-wrap gap-2">
        <a href={VIDEO} target="_blank" rel="noopener noreferrer"
          className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">
          <SiYoutube className="h-4 w-4" aria-hidden /> Watch on YouTube
        </a>
        <a href={TRACK} target="_blank" rel="noopener noreferrer"
          className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium hover:border-ink/30">
          <SiSpotify className="h-4 w-4" aria-hidden /> Play One by One
        </a>
      </Reveal>
    </section>
  );
}
