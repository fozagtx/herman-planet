import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Countdown, GiveawayForm, WallForm } from "@/components/pack/forms";
import { Wolf } from "@/components/pack/wolf";
import { CATALOGUE } from "@/lib/catalogue";
import { getFeaturedPosts, getLastWinner, getLiveItems, getOpenGiveaway, getPackName } from "@/lib/pack";

export const metadata = { title: "The Pack · Herman Suede", description: "Herman Suede's fan community: the wall, giveaways, merch and unreleased music." };

// Sourced: The Upper Entertainment (2025) for After Prep and the school tour; Wikipedia for Black Love.
const PROOF = [
  { big: "1,000+", line: "tickets for After Prep, his first headline show, in 2019" },
  { big: "15", line: "schools on his meet-and-greet tour across Accra" },
  { big: "Womba", line: "his feature with Shakka on Sarkodie's Black Love (2019)" },
];

export default function PackPage() {
  return (
    <main className="min-h-svh bg-paper text-ink">
      <Suspense fallback={<div className="h-[80svh] bg-ink" />}>
        <Hero />
      </Suspense>
      <section className="mx-auto grid max-w-6xl gap-3 px-6 py-10 sm:grid-cols-3 md:px-8 md:py-14">
        {PROOF.map((p, i) => (
          <Reveal key={p.big} delay={i * 0.06} className="surface p-5">
            <p className="font-[family-name:var(--font-serif)] text-[44px] leading-none">{p.big}</p>
            <p className="mt-2 text-[15px] text-muted-foreground">{p.line}</p>
          </Reveal>
        ))}
        <p className="text-xs text-muted-foreground sm:col-span-3">
          Sources: <a className="underline underline-offset-4" href="https://theupperent.com/2025/06/19/upper-spotlight-herman-suede/" target="_blank" rel="noopener noreferrer">The Upper Entertainment</a>,{" "}
          <a className="underline underline-offset-4" href="https://en.wikipedia.org/wiki/Black_Love_(Sarkodie_album)" target="_blank" rel="noopener noreferrer">Black Love (Wikipedia)</a>.
        </p>
      </section>
      <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse rounded-[15px] bg-sunk" />}>
        <Giveaway />
        <Wall />
        <Shop />
      </Suspense>
      <footer className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 pb-16 pt-6 text-[13px] text-muted-foreground md:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Herman Suede</Link>
        <span>🐺🏴‍☠️🤍</span>
      </footer>
    </main>
  );
}

async function Hero() {
  const name = await getPackName();
  return (
    <section className="relative overflow-hidden bg-ink px-6 pb-16 pt-6 text-surface md:pb-24">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-surface/70 hover:text-surface">
          <ArrowLeft className="h-4 w-4" /> Herman Suede
        </Link>
        <span className="text-[11px] font-medium uppercase tracking-wider text-surface/50">Fan community</span>
      </div>
      <div className="mx-auto mt-8 grid max-w-6xl items-center gap-10 md:mt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative mx-auto aspect-square w-full max-w-[420px]">
          <div className="absolute inset-0 grid place-items-center" aria-hidden>
            <span className="howl-ring absolute h-full w-full rounded-full border border-[#edff00]/40" />
            <span className="howl-ring absolute h-full w-full rounded-full border border-[#edff00]/40" />
            <span className="howl-ring absolute h-full w-full rounded-full border border-[#edff00]/40" />
          </div>
          <Wolf className="relative h-full w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#edff00]">Welcome to</p>
          <h1 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(64px,11vw,148px)] leading-[0.85]">{name}</h1>
          <p className="mt-6 max-w-md text-[18px] leading-relaxed text-surface/80">
            Herman calls himself a lone wolf. No handouts, no shortcuts: he built this pack one fan at a time.
          </p>
          <blockquote className="mt-6 max-w-md border-l-2 border-[#edff00] pl-4 text-[17px] leading-relaxed text-surface/90">
            “To the fans, who have become more like family, thank you for keeping me in your hearts through it all.”
            <footer className="mt-2 text-[13px] text-surface/50">Herman Suede, 24 Nov 2026</footer>
          </blockquote>
          <div className="mt-8 flex flex-wrap gap-2">
            <a href="#wall" className="press inline-flex min-h-11 items-center rounded-full bg-[#edff00] px-5 text-sm font-semibold text-ink">Join the wall</a>
            <a href="#shop" className="press inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-medium text-surface hover:border-white/50">Shop</a>
          </div>
        </div>
      </div>
    </section>
  );
}

async function Giveaway() {
  const [g, last] = await Promise.all([getOpenGiveaway(), getLastWinner()]);
  return (
    <section id="giveaway" className="mx-auto max-w-6xl px-6 pb-10 md:px-8 md:pb-14">
      <Reveal className="relative overflow-hidden rounded-[15px] bg-ink p-6 text-surface md:p-8">
        <Wolf className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 opacity-20 md:h-72 md:w-72" />
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#edff00]">Giveaway</p>
        {g ? (
          <>
            <h2 className="mt-2 max-w-xl text-[clamp(28px,4vw,44px)] font-semibold leading-tight tracking-tight">{g.title}</h2>
            <p className="mt-2 text-[17px] text-surface/80">Prize: {g.prize}</p>
            {g.details && <p className="mt-2 max-w-xl text-[15px] text-surface/65">{g.details}</p>}
            <p className="mt-3 text-sm font-medium text-[#edff00]"><Countdown endsAt={g.endsAt.toISOString()} /></p>
            <div className="mt-5 max-w-2xl"><GiveawayForm id={g.id} /></div>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-[clamp(26px,3.6vw,40px)] font-semibold leading-tight tracking-tight">Next giveaway, coming soon.</h2>
            <p className="mt-2 max-w-lg text-[15px] text-surface/70">
              {last?.winner ? `Last winner: ${last.winner}, who won ${last.prize}. ` : ""}Follow Herman on Instagram so you hear the moment one opens.
            </p>
            <a href="https://www.instagram.com/hermansuede1/" target="_blank" rel="noopener noreferrer" className="press mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 px-5 text-sm font-medium hover:border-white/50">
              Follow on Instagram <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </>
        )}
      </Reveal>
    </section>
  );
}

async function Wall() {
  const posts = await getFeaturedPosts();
  return (
    <section id="wall" className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:px-8 md:py-14">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">The wall</p>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(40px,5.4vw,72px)] leading-[0.95]">Howls from the pack</h2>
        {posts.length === 0 ? (
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/75">The wall is waiting for its first howl. Be the first: what does Herman&apos;s music mean to you?</p>
        ) : (
          <div className="mt-6 columns-1 gap-3 sm:columns-2 [&>*]:mb-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 6) * 0.04} className="surface break-inside-avoid p-5">
                <p className="text-[16px] leading-relaxed">“{p.message}”</p>
                <p className="mt-3 text-[13px] text-muted-foreground">
                  🐺 {p.name}{p.city ? `, ${p.city}` : ""}{p.song ? ` · on ${p.song}` : ""}
                </p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <div className="md:pt-24"><WallForm songs={CATALOGUE.map((c) => c.title)} /></div>
    </section>
  );
}

async function Shop() {
  const items = await getLiveItems();
  const merch = items.filter((i) => i.kind === "merch");
  const unreleased = items.filter((i) => i.kind === "unreleased");
  const Buy = ({ href, label }: { href: string; label: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">
      {label} <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
  return (
    <section id="shop" className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Shop</p>
      <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(40px,5.4vw,72px)] leading-[0.95]">For the pack</h2>

      <h3 className="mt-10 text-lg font-semibold tracking-tight">Merch</h3>
      {merch.length === 0 ? (
        <p className="mt-2 text-[15px] text-muted-foreground">The first drop is on its way. Follow Herman to catch it.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {merch.map((m) => (
            <Reveal key={m.id} className="surface overflow-hidden p-2">
              {m.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.imageUrl} alt={m.title} className="aspect-square w-full rounded-[11px] object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center rounded-[11px] bg-ink"><Wolf className="h-1/2 w-1/2" /></div>
              )}
              <div className="p-3">
                <p className="font-medium">{m.title}</p>
                <p className="num text-sm text-muted-foreground">{m.price}</p>
                {m.description && <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{m.description}</p>}
                <div className="mt-3"><Buy href={m.buyUrl} label="Buy" /></div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <h3 className="mt-12 text-lg font-semibold tracking-tight">Unreleased music</h3>
      {unreleased.length === 0 ? (
        <p className="mt-2 text-[15px] text-muted-foreground">Nothing in the vault for sale yet. When Herman opens it, it lands here first.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {unreleased.map((u) => (
            <li key={u.id}>
              <Reveal className="surface flex flex-wrap items-center gap-4 p-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-ink">
                  {u.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Wolf className="h-10 w-10" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{u.title} <span className="num text-muted-foreground">· {u.price}</span></p>
                  {u.description && <p className="text-[13px] text-muted-foreground">{u.description}</p>}
                  {u.previewUrl && <audio controls preload="none" src={u.previewUrl} className="mt-2 h-9 w-full max-w-sm" />}
                </div>
                <Buy href={u.buyUrl} label="Buy" />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-muted-foreground">Checkout opens on Herman&apos;s official store.</p>
    </section>
  );
}
