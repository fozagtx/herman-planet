import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiInstagram, SiSpotify } from "react-icons/si";
import { Reveal } from "@/components/reveal";
import { Chapters, PictureTrail } from "@/components/pack/chapters";
import { TicketButton } from "@/components/pack/events";
import { BuyButton, Countdown, GiveawayForm, WallForm } from "@/components/pack/forms";
import { paymentsOn } from "@/lib/bachs";
import { CATALOGUE } from "@/lib/catalogue";
import { getUpcomingEvents } from "@/lib/events";
import { getFeaturedPosts, getLastWinner, getLiveItems, getOpenGiveaway, getPackName } from "@/lib/pack";

export const metadata = { title: "The Pack · Herman Suede", description: "Herman Suede's fan community: shows, meetups, merch, unreleased music, giveaways and the fan wall." };

const Kicker = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <p className={`text-[11px] font-medium uppercase tracking-[0.18em] ${light ? "text-surface/70" : "text-muted-foreground"}`}>{children}</p>
);
const Sample = () => (
  <span className="rounded-full bg-sunk px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Sample</span>
);
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(44px,6vw,84px)] leading-[0.92]">{children}</h2>
);
// Song colours, so a fan's note carries the colour of the song that got them.
const SONG_TINT: Record<string, string> = { "She Get": "#f6a19a", "ONE BY ONE II": "#c9b7f2", "One by One": "#ffcf8a", Kumbaya: "#ffcf8a", "Naa Kwarley": "#f6a19a", Free: "#c9b7f2" };

// How the pack was built. Every line is sourced.
const STORY: { year: string; title: string; body: string; source: { name: string; url: string }; image?: { src: string; alt: string; credit: string } }[] = [
  { year: "2017", title: "Be Mine", body: "He is 15. His first single gets people asking who he is.", source: { name: "Unorthodox Reviews", url: "https://unorthodoxreviews.com/herman-suede-ep-bitter-sweet" } },
  { year: "2018", title: "First show abroad", body: "Ghana Party in the Park in London: “It felt surreal.”", source: { name: "Ghana Music", url: "https://ghanamusic.com/interviews/2025/06/24/herman-suede-talks-growth-sound-and-one-by-one-ii/" } },
  {
    year: "2019",
    title: "The pack shows up",
    body: "His debut EP, Hi I'm Herman. His own headline show, After Prep, sells over 1,000 tickets, and he takes a meet-and-greet tour to 15 schools. Then Sarkodie puts him on “Womba” with Shakka, on Black Love.",
    source: { name: "The Upper Entertainment", url: "https://theupperent.com/2025/06/19/upper-spotlight-herman-suede/" },
    image: { src: "/img/sarkodie.jpg", alt: "Sarkodie", credit: "Sarkodie, who featured Herman on “Womba” (2019). Photo: Owula kpakpo, CC BY SA 4.0, Wikimedia Commons" },
  },
  { year: "2021", title: "Bittersweet", body: "His second EP is nominated for EP of the Year at the 3 Music Awards.", source: { name: "Unorthodox Reviews", url: "https://unorthodoxreviews.com/herman-suede-kumbaya" } },
  { year: "2023", title: "Los Angeles", body: "He opens for Victony at The Roxy in Hollywood, then tours schools and universities across Ghana with shows and talks.", source: { name: "The Upper Entertainment", url: "https://theupperent.com/2025/06/19/upper-spotlight-herman-suede/" } },
  { year: "2025", title: "ONE BY ONE II", body: "The Therapist hears One by One and insists on a verse.", source: { name: "Ghana Music", url: "https://ghanamusic.com/interviews/2025/06/24/herman-suede-talks-growth-sound-and-one-by-one-ii/" } },
  {
    year: "2026",
    title: "Back in office",
    body: "A degree from Liberty University in May, after eight years of school and music. In November, She Get.",
    source: { name: "The Vaultz", url: "https://thevaultznews.com/2026/11/25/herman-suede-drops-new-single-she-get/" },
    image: { src: "/img/herman.jpg", alt: "Herman Suede", credit: "Herman Suede" },
  },
];

const SECTIONS = [
  { id: "story", label: "Story" },
  { id: "events", label: "Shows" },
  { id: "giveaway", label: "Giveaway" },
  { id: "wall", label: "Wall" },
  { id: "shop", label: "Shop" },
];

export default function PackPage() {
  return (
    <main className="min-h-svh bg-paper text-ink">
      <Suspense fallback={<div className="mx-auto mt-5 h-[78svh] max-w-6xl animate-pulse rounded-[22px] bg-sunk" />}>
        <Hero />
      </Suspense>
      <nav aria-label="On this page" className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2 px-6 pt-8 md:px-8">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="press inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-medium hover:border-ink/30">{s.label}</a>
        ))}
      </nav>
      <Proof />
      <section className="mx-auto max-w-6xl px-4 pt-14 md:px-8 md:pt-20"><PictureTrail /></section>
      <Story />
      <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse rounded-[15px] bg-sunk" />}>
        <Events />
        <Giveaway />
        <Wall />
        <Shop />
      </Suspense>
      <Closing />
    </main>
  );
}

async function Hero() {
  const name = await getPackName();
  return (
    <section className="px-4 pt-4 md:px-8 md:pt-5">
      <div className="relative mx-auto h-[78svh] min-h-[560px] max-w-6xl overflow-hidden rounded-[22px] bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/wolf.jpg" alt="A grey wolf with amber eyes looking at the camera" className="absolute inset-0 h-full w-full object-cover object-[50%_42%] motion-safe:animate-[pack-zoom_18s_ease-out_both]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,8,18,0.88)_0%,rgba(10,8,18,0.35)_45%,rgba(10,8,18,0.15)_70%,rgba(10,8,18,0.45)_100%)]" />
        <div className="relative flex h-full flex-col justify-between p-5 text-surface md:p-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black/25 px-4 text-sm font-medium backdrop-blur-sm hover:bg-black/40">
              <ArrowLeft className="h-4 w-4" /> Herman Suede
            </Link>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-surface/70">Fan community</span>
          </div>
          <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
            <Reveal>
              <Kicker light>Welcome to</Kicker>
              <h1 className="mt-2 font-[family-name:var(--font-serif)] text-[clamp(72px,13vw,176px)] leading-[0.82]">{name}</h1>
              <p className="mt-5 max-w-md text-[18px] leading-relaxed text-surface/85">
                Herman calls himself a lone wolf. No handouts, no shortcuts: he built this pack one fan at a time.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="#events" className="press inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface/90">See him live</a>
                <a href="#shop" className="press inline-flex min-h-11 items-center rounded-full border border-white/30 px-5 text-sm font-medium hover:border-white/60">Shop the pack</a>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <blockquote className="border-l-2 border-[#edff00] pl-4 text-[17px] leading-relaxed text-surface/90 md:mb-2">
                “To the fans, who have become more like family, thank you for keeping me in your hearts through it all.”
                <footer className="mt-2 text-[13px] text-surface/60">Herman Suede, 24 Nov 2026</footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-6xl px-1 text-right text-[11px] text-muted-foreground">Photo: Rob Bertrand, Pexels</p>
    </section>
  );
}

function Proof() {
  const items = [
    { big: "1,000+", line: "tickets for After Prep, his first headline show (2019)" },
    { big: "15", line: "schools on his meet-and-greet tour across Accra" },
    { big: "Womba", line: "his feature with Shakka on Sarkodie's Black Love" },
  ];
  return (
    <section className="mx-auto grid max-w-6xl gap-px overflow-hidden px-6 pt-12 md:grid-cols-3 md:px-8 md:pt-16">
      {items.map((p, i) => (
        <Reveal key={p.big} delay={i * 0.06} className="border-t border-line pt-5 md:pr-8">
          <p className="font-[family-name:var(--font-serif)] text-[clamp(56px,7vw,88px)] leading-none">{p.big}</p>
          <p className="mt-2 max-w-[28ch] text-[15px] text-muted-foreground">{p.line}</p>
        </Reveal>
      ))}
    </section>
  );
}

function Story() {
  return (
    <section id="story" className="mx-auto max-w-6xl scroll-mt-6 px-6 py-16 md:px-8 md:py-24">
      <Kicker>How the pack was built</Kicker>
      <H2>Nine years, one fan at a time</H2>
      <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-ink/75">Six chapters, six songs. Open a book to read the chapter, then hear the song that goes with it.</p>
      <div className="-mx-2 mt-8 md:mx-0"><Chapters /></div>
      <Kicker><span className="mt-16 block">The record, with sources</span></Kicker>
      <ol className="mt-6">
        {STORY.map((s) => (
          <li key={s.year} className="grid gap-4 border-t border-line py-8 md:grid-cols-[200px_minmax(0,1fr)_240px] md:gap-8">
            <Reveal>
              <p className="num font-[family-name:var(--font-serif)] text-[clamp(52px,6vw,76px)] leading-none text-ink/85">{s.year}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h3 className="text-[26px] font-semibold leading-tight tracking-tight">{s.title}</h3>
              <p className="mt-2 max-w-xl text-[17px] leading-relaxed text-ink/80">{s.body}</p>
              <a href={s.source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-9 items-center gap-1 text-[13px] text-muted-foreground underline-offset-4 hover:text-ink hover:underline">
                {s.source.name} <ArrowUpRight className="h-3 w-3" />
              </a>
            </Reveal>
            {s.image ? (
              <Reveal delay={0.1}>
                <figure className="surface p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image.src} alt={s.image.alt} className="aspect-[4/5] w-full rounded-[11px] object-cover object-top" />
                  <figcaption className="px-1 pt-2 text-[11px] leading-snug text-muted-foreground">{s.image.credit}</figcaption>
                </figure>
              </Reveal>
            ) : (
              <span className="hidden md:block" />
            )}
          </li>
        ))}
      </ol>
      <Reveal className="surface mt-6 grid items-center gap-6 p-3 md:grid-cols-[200px_minmax(0,1fr)] md:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/drake.jpg" alt="Drake" className="aspect-[4/3] w-full rounded-[11px] object-cover object-top md:aspect-[4/5]" />
        <div className="p-2">
          <Kicker>Inspired by</Kicker>
          <p className="mt-2 font-[family-name:var(--font-serif)] text-[clamp(30px,3.4vw,44px)] leading-[1.05]">The artists Herman grew up on</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Drake", "Wizkid", "Burna Boy", "Sarkodie", "King Promise"].map((a) => (
              <span key={a} className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium">{a}</span>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-snug text-muted-foreground">
            Sources: <a className="underline underline-offset-2" href="https://unorthodoxreviews.com/herman-suede" target="_blank" rel="noopener noreferrer">Unorthodox Reviews</a>,{" "}
            <a className="underline underline-offset-2" href="https://thevaultznews.com/2026/11/25/herman-suede-drops-new-single-she-get/" target="_blank" rel="noopener noreferrer">The Vaultz</a>. Photo of Drake: The Come Up Show, CC BY 2.0, Wikimedia Commons. Drake is not affiliated with this site.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

async function Events() {
  const list = await getUpcomingEvents();
  return (
    <section id="events" className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-16 md:px-8 md:pb-24">
      <Kicker>Shows & meetups</Kicker>
      <H2>See him in person</H2>
      {list.length === 0 ? (
        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink/75">New dates, coming soon. Follow Herman on Instagram to know the moment tickets go live.</p>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {list.map((e, i) => {
            const d = e.startsAt;
            const tz = { timeZone: "Africa/Accra" } as const;
            const when = d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", ...tz });
            const left = e.capacity ? Math.max(0, e.capacity - e.sold) : null;
            const free = !e.price && !e.amount;
            return (
              <li key={e.id}>
                <Reveal delay={i * 0.06} className="surface group flex h-full flex-col overflow-hidden p-2">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[13px] bg-ink">
                    {e.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.imageUrl} alt="" className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.03]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-[11px] bg-surface px-3 py-2 text-center text-ink shadow">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d.toLocaleString("en-GB", { month: "short", ...tz })}</p>
                      <p className="num font-[family-name:var(--font-serif)] text-[32px] leading-none">{d.toLocaleString("en-GB", { day: "numeric", ...tz })}</p>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 text-surface">
                      <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider backdrop-blur-sm">{e.kind === "show" ? "Show" : "Meetup"}</span>
                      {e.sample && <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider backdrop-blur-sm">Sample</span>}
                      {left !== null && <span className="num ml-auto rounded-full bg-[#edff00] px-2.5 py-1 text-[11px] font-semibold text-ink">{left > 0 ? `${left} left` : "Sold out"}</span>}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="text-[22px] font-semibold leading-snug tracking-tight">{e.title}</p>
                    <p className="mt-1 text-[14px] text-muted-foreground">{when} · {e.venue}, {e.city}</p>
                    {e.details && <p className="mt-2 text-[14px] leading-relaxed text-ink/75">{e.details}</p>}
                    <div className="mt-auto pt-4">
                      <TicketButton id={e.id} title={e.title} when={when} place={`${e.venue}, ${e.city}`} price={e.price} free={free} online={paymentsOn() && !!e.amount} sample={e.sample} left={left} kind={e.kind} />
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

async function Giveaway() {
  const [g, last] = await Promise.all([getOpenGiveaway(), getLastWinner()]);
  return (
    <section id="giveaway" className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-16 md:px-8 md:pb-24">
      <Reveal className="surface grid gap-8 overflow-hidden p-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-4">
        {g ? (
          <>
            <div className="relative overflow-hidden rounded-[15px] bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CATALOGUE[0].art} alt="She Get cover" className="h-full min-h-[280px] w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-5 text-surface">
                <Kicker light>The prize</Kicker>
                <p className="mt-1 text-[22px] font-semibold leading-snug tracking-tight">{g.prize}</p>
              </div>
            </div>
            <div className="p-2 md:py-4 md:pr-4">
              <div className="flex items-center gap-2"><Kicker>Giveaway</Kicker>{g.sample && <Sample />}</div>
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(40px,5vw,64px)] leading-[0.95]">{g.title}</h2>
              {g.details && <p className="mt-3 text-[15px] text-muted-foreground">{g.details}</p>}
              <div className="mt-5"><Countdown endsAt={g.endsAt.toISOString()} variant="boxes" /></div>
              <div className="mt-6"><GiveawayForm id={g.id} sample={g.sample} /></div>
            </div>
          </>
        ) : (
          <div className="p-4 md:col-span-2">
            <Kicker>Giveaway</Kicker>
            <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(36px,4.6vw,60px)] leading-[0.95]">Next giveaway, coming soon.</h2>
            <p className="mt-3 max-w-lg text-[15px] text-muted-foreground">
              {last?.winner ? `Last winner: ${last.winner}, who won ${last.prize}. ` : ""}Follow Herman on Instagram to hear the moment one opens.
            </p>
          </div>
        )}
      </Reveal>
    </section>
  );
}

async function Wall() {
  const posts = await getFeaturedPosts();
  return (
    <section id="wall" className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-16 md:px-8 md:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>The wall</Kicker>
          <H2>Howls from the pack</H2>
        </div>
        <p className="max-w-xs text-[15px] text-muted-foreground">Notes from fans, picked by Herman&apos;s team. Yours could be next.</p>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {posts.length === 0 ? (
          <p className="max-w-md text-[17px] leading-relaxed text-ink/75">The wall is waiting for its first howl.</p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 [&>*]:mb-4">
            {posts.map((p, i) => {
              const tint = (p.song && SONG_TINT[p.song]) || "#c9b7f2";
              return (
                <Reveal key={p.id} delay={Math.min(i, 6) * 0.05} className="surface relative break-inside-avoid overflow-hidden p-5">
                  <span aria-hidden className="pointer-events-none absolute -left-1 -top-6 font-[family-name:var(--font-serif)] text-[120px] leading-none" style={{ color: tint }}>“</span>
                  <p className="relative pt-6 font-[family-name:var(--font-serif)] text-[22px] leading-[1.25]">{p.message}</p>
                  <div className="relative mt-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-ink" style={{ background: tint }}>{p.name.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1 text-[13px] leading-tight">
                      <span className="block font-medium">{p.name}{p.city ? `, ${p.city}` : ""}</span>
                      {p.song && <span className="text-muted-foreground">on {p.song}</span>}
                    </span>
                    {p.sample && <Sample />}
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
        <div className="md:sticky md:top-6 md:self-start"><WallForm songs={CATALOGUE.map((c) => c.title)} /></div>
      </div>
    </section>
  );
}

async function Shop() {
  const items = await getLiveItems();
  const merch = items.filter((i) => i.kind === "merch");
  const unreleased = items.filter((i) => i.kind === "unreleased");
  const buy = (i: (typeof items)[number]) =>
    i.buyUrl ? (
      <a href={i.buyUrl} target="_blank" rel="noopener noreferrer" className="press inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">
        Buy <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    ) : (
      <BuyButton item={{ id: i.id, title: i.title, price: i.price, imageUrl: i.imageUrl, sizes: i.sizes, buyUrl: i.buyUrl, sample: i.sample, kind: i.kind, online: paymentsOn() && !!i.amount }} />
    );
  return (
    <section id="shop" className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-16 md:px-8 md:pb-24">
      <Kicker>Shop</Kicker>
      <H2>For the pack</H2>

      {merch.length === 0 ? (
        <p className="mt-4 text-[15px] text-muted-foreground">The first drop is on its way. Follow Herman to catch it.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {merch.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.06} className="surface group flex flex-col p-2">
              <div className="relative overflow-hidden rounded-[13px] bg-sunk">
                {m.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageUrl} alt={`${m.title} design`} className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                )}
                <span className="num absolute right-3 top-3 rounded-full bg-surface px-3 py-1 text-sm font-semibold shadow">{m.price}</span>
                {m.sample && <span className="absolute left-3 top-3"><Sample /></span>}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-[20px] font-semibold tracking-tight">{m.title}</p>
                {m.description && <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{m.description}</p>}
                {m.sizes && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.sizes.split(",").map((z) => (
                      <span key={z} className="rounded-full border border-line px-2.5 py-0.5 text-[12px] font-medium text-muted-foreground">{z.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-4 [&>button]:w-full">{buy(m)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-14">
        <Kicker>From the vault</Kicker>
        <h3 className="mt-2 font-[family-name:var(--font-serif)] text-[clamp(32px,4vw,48px)] leading-none">Unreleased music</h3>
        {unreleased.length === 0 ? (
          <p className="mt-3 text-[15px] text-muted-foreground">Nothing in the vault for sale yet. When Herman opens it, it lands here first.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {unreleased.map((u) => (
              <li key={u.id}>
                <Reveal className="flex flex-wrap items-center gap-4 rounded-[18px] bg-ink p-3 text-surface">
                  {u.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-[13px] object-cover grayscale" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">{u.title}</p>
                      {u.sample && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-surface/70">Sample</span>}
                    </div>
                    {u.description && <p className="text-[14px] text-surface/65">{u.description}</p>}
                    {u.previewUrl && <audio controls preload="none" src={u.previewUrl} className="mt-2 h-9 w-full max-w-sm" />}
                  </div>
                  <div className="w-full sm:w-auto [&>button]:w-full [&>button]:bg-[#edff00] [&>button]:text-ink">{buy(u)}</div>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="px-4 pb-6 md:px-8">
      <div className="surface mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 p-6 md:p-10">
        <div>
          <Kicker>Run with the pack</Kicker>
          <p className="mt-2 font-[family-name:var(--font-serif)] text-[clamp(36px,4.6vw,60px)] leading-[0.95]">Hear the next one first.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="https://open.spotify.com/artist/795E5FXQUgbjuPBxk6igGm" target="_blank" rel="noopener noreferrer" className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">
            <SiSpotify className="h-4 w-4" aria-hidden /> Follow on Spotify
          </a>
          <a href="https://www.instagram.com/hermansuede1/" target="_blank" rel="noopener noreferrer" className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium hover:border-ink/30">
            <SiInstagram className="h-4 w-4" aria-hidden /> Instagram
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-1 pb-10 pt-5 text-[13px] text-muted-foreground">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Herman Suede</Link>
        <span>🐺🏴‍☠️🤍</span>
      </div>
    </section>
  );
}
