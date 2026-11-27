import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Note, Track } from "@/lib/types";
import { CandyLink } from "./candy-link";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const DOT = { sound: "#ffcf8a", lyrics: "#f6a19a", production: "#c9b7f2" } as const;

export function LatestRelease({ track, notes }: { track: Track; notes: Note[] }) {
  return (
    <section id="listen" className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2 md:gap-16 md:px-8">
      <div className="surface p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.artworkUrl ?? ""} alt={`${track.title} cover art`} className="aspect-square w-full rounded-[13px] object-cover" />
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">New single · {track.year}</p>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(56px,8vw,112px)] leading-[0.9] tracking-[-0.02em]">{track.title}</h2>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/75">
          It opens with Herman singing in Ga over traditional percussion, then folds into synth drums and bass. Produced by MILN and BNYX.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <CandyLink href={`/t/${track.slug}`}>Listen</CandyLink>
          {track.releases.filter((r) => r.href).map((r) => (
            <a key={r.platform} href={r.href!} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-ink/30">
              {r.platform} <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          ))}
        </div>
        {notes.length > 0 && (
          <div className="mt-10 border-t border-line pt-6">
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
      </div>
    </section>
  );
}
