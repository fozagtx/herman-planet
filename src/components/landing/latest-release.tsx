import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { PlatformIcon } from "@/lib/platforms";
import { ArrowUpRight } from "lucide-react";
import type { Note, Track } from "@/lib/types";
import { ShareSheet } from "@/components/ui/share-sheet";
import { CandyLink } from "./candy-link";
import { ReleaseCover } from "./release-cover";
import { ReleasedAgo } from "./released-ago";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const DOT = { sound: "#ffcf8a", lyrics: "#f6a19a", production: "#c9b7f2" } as const;

export function LatestRelease({ track, notes }: { track: Track; notes: Note[] }) {
  return (
    <section id="listen" className="mx-auto grid w-full max-w-6xl items-center gap-8 px-6 py-14 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
      <Reveal><ReleaseCover src={track.artworkUrl ?? ""} alt={`${track.title} cover art`} /></Reveal>
      <Reveal delay={0.08}>
        <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
          </span>
          Out now · New single · <ReleasedAgo iso="2026-11-25" />
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(56px,8vw,112px)] leading-[0.9] tracking-[-0.02em]">{track.title}</h2>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/75">
          It opens with Herman singing in Ga over traditional percussion, then folds into synth drums and bass. Produced by MILN and BNYX.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <CandyLink href={`/t/${track.slug}`}>Listen</CandyLink>
          {track.releases.filter((r) => r.href).map((r) => (
            <a key={r.platform} href={r.href!} target="_blank" rel="noopener noreferrer"
              className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-ink/30">
              <PlatformIcon name={r.platform} /> {r.platform}
            </a>
          ))}
          <ShareSheet url={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/t/${track.slug}`} title={`Share ${track.title}`} theme="light" variant="compact" />
        </div>
        {notes.length > 0 && (
          <div className="mt-8 border-t border-line pt-5 md:mt-10 md:pt-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Inside the song</p>
            <ul className="mt-2 divide-y divide-line">
              {notes.map((n) => (
                <li key={n.id}>
                  <Link href={`/t/${track.slug}/m/${n.t}`} className="flex min-h-12 items-center gap-4 hover:text-ink/70">
                    <span className="num w-10 text-sm text-muted-foreground">{fmt(n.t)}</span>
                    <span className="h-2 w-2 rounded-full" style={{ background: DOT[n.kind] }} />
                    <span className="flex-1 font-medium">{n.title}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>
    </section>
  );
}
