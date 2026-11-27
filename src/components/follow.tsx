import { PLATFORMS } from "@/lib/platforms";
import type { Track } from "@/lib/types";

const FOLLOW = PLATFORMS.filter((p) => ["Spotify", "Apple Music", "Instagram", "YouTube"].includes(p.label));

/** Brief step 04: follow future releases, or see an approved live update. No forms, no data kept here. */
export function Follow({ liveUpdate }: { liveUpdate?: Track["liveUpdate"] }) {
  return (
    <section id="follow" className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-24 md:grid-cols-2 md:px-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Come back</p>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(44px,6vw,80px)] leading-[0.95]">Hear the next one first.</h2>
        <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-ink/75">
          Follow Herman where you listen. New releases land in your feed the day they drop.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {FOLLOW.map(({ label, href, Icon }, i) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className={`press inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium ${i === 0 ? "bg-ink text-surface hover:bg-ink/85" : "border border-line bg-surface hover:border-ink/30"}`}>
              <Icon className="h-4 w-4" aria-hidden /> {i === 0 ? `Follow on ${label}` : label}
            </a>
          ))}
        </div>
      </div>
      <div className="surface self-start p-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Live</p>
        {liveUpdate?.approved ? (
          <>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{liveUpdate.title}</p>
            <p className="mt-2 text-[15px] text-muted-foreground">{liveUpdate.body}</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-2xl font-semibold tracking-tight">New dates, coming soon.</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Herman&apos;s team is lining up the next run of shows. Follow on Spotify or Instagram and you&apos;ll know the moment tickets go live.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
