import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { BuyButton, Countdown, GiveawayForm, WallForm } from "@/components/pack/forms";
import { CATALOGUE } from "@/lib/catalogue";
import { paymentsOn } from "@/lib/bachs";
import { getFeaturedPosts, getLastWinner, getLiveItems, getOpenGiveaway, getPackName } from "@/lib/pack";

export const metadata = { title: "The Pack · Herman Suede", description: "Herman Suede's fan community: the wall, giveaways, merch and unreleased music." };

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{children}</p>
);
const Sample = () => (
  <span className="rounded-full bg-sunk px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sample</span>
);

// How the pack was built. Every line is sourced.
const STORY: { year: string; title: string; body: string; source: { name: string; url: string }; image?: { src: string; alt: string; credit: string } }[] = [
  { year: "2017", title: "Be Mine", body: "He is 15. His first single gets people asking who he is.", source: { name: "Unorthodox Reviews", url: "https://unorthodoxreviews.com/herman-suede-ep-bitter-sweet" } },
  { year: "2018", title: "First show abroad", body: "Ghana Party in the Park in London: “It felt surreal.”", source: { name: "Ghana Music", url: "https://ghanamusic.com/interviews/2025/06/24/herman-suede-talks-growth-sound-and-one-by-one-ii/" } },
  {
    year: "2019",
    title: "The pack shows up",
    body: "His debut EP, Hi I'm Herman. His own headline show, After Prep, sells over 1,000 tickets, and he takes a meet-and-greet tour to 15 schools. Then Sarkodie puts him on “Womba” with Shakka, on Black Love.",
    source: { name: "The Upper Entertainment", url: "https://theupperent.com/2025/06/19/upper-spotlight-herman-suede/" },
    image: { src: "/img/sarkodie.jpg", alt: "Sarkodie", credit: "Sarkodie, who featured Herman on “Womba” (2019). Photo: Owula kpakpo, CC BY-SA 4.0, via Wikimedia Commons" },
  },
  { year: "2021", title: "Bittersweet", body: "His second EP is nominated for EP of the Year at the 3 Music Awards.", source: { name: "Unorthodox Reviews", url: "https://unorthodoxreviews.com/herman-suede-kumbaya" } },
  { year: "2023", title: "Los Angeles", body: "He opens for Victony at The Roxy in Hollywood, then tours schools and universities across Ghana with shows and talks.", source: { name: "The Upper Entertainment", url: "https://theupperent.com/2025/06/19/upper-spotlight-herman-suede/" } },
  { year: "2025", title: "ONE BY ONE II", body: "The Therapist hears One by One and insists on a verse.", source: { name: "Ghana Music", url: "https://ghanamusic.com/interviews/2025/06/24/herman-suede-talks-growth-sound-and-one-by-one-ii/" } },
  { year: "2026", title: "Back in office", body: "A degree from Liberty University in May after eight years of school and music. In November, She Get.", source: { name: "The Vaultz", url: "https://thevaultznews.com/2026/11/25/herman-suede-drops-new-single-she-get/" } },
];

export default function PackPage() {
  return (
    <main className="min-h-svh bg-paper text-ink">
      <Suspense fallback={<div className="mx-auto h-[70svh] max-w-6xl animate-pulse rounded-[15px] bg-sunk" />}>
        <Hero />
      </Suspense>
      <Story />
      <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse rounded-[15px] bg-sunk" />}>
        <Giveaway />
        <Wall />
        <Shop />
      </Suspense>
      <footer className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 pb-16 pt-6 text-[13px] text-muted-foreground md:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Herman Suede</Link>
        <span>Wolf photo: Rob Bertrand, Pexels</span>
      </footer>
    </main>
  );
}

async function Hero() {
  const name = await getPackName();
  return (
    <section className="px-6 pt-5 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink/70 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Herman Suede
        </Link>
        <Kicker>Fan community</Kicker>
      </div>
      <div className="mx-auto mt-6 grid max-w-6xl items-center gap-8 md:mt-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-14">
        <Reveal>
          <Kicker>Welcome to</Kicker>
          <h1 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(64px,11vw,148px)] leading-[0.85]">{name}</h1>
          <p className="mt-6 max-w-md text-[18px] leading-relaxed text-ink/80">
            Herman calls himself a lone wolf. No handouts, no shortcuts: he built this pack one fan at a time.
          </p>
          <blockquote className="mt-6 max-w-md border-l-2 border-ink pl-4 text-[17px] leading-relaxed">
            “To the fans, who have become more like family, thank you for keeping me in your hearts through it all.”
            <footer className="mt-2 text-[13px] text-muted-foreground">Herman Suede, 24 Nov 2026</footer>
          </blockquote>
          <div className="mt-8 flex flex-wrap gap-2">
            <a href="#wall" className="press inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">Join the wall</a>
            <a href="#giveaway" className="press inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-medium hover:border-ink/30">Giveaway</a>
            <a href="#shop" className="press inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-medium hover:border-ink/30">Shop</a>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="surface p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/wolf.jpg" alt="A grey wolf with amber eyes looking at the camera" className="aspect-[4/5] w-full rounded-[13px] object-cover object-[50%_45%]" />
        </Reveal>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
      <Kicker>How the pack was built</Kicker>
      <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-serif)] text-[clamp(40px,5.4vw,72px)] leading-[0.95]">Nine years, one fan at a time</h2>
      <ol className="relative mt-10 border-l border-line pl-6 md:pl-10">
        {STORY.map((s, i) => (
          <li key={s.year} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-ink md:-left-[47px]" aria-hidden />
            <Reveal delay={Math.min(i, 4) * 0.04} className={s.image ? "grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-start" : ""}>
              <div>
                <p className="num text-sm font-medium text-muted-foreground">{s.year}</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 max-w-xl text-[17px] leading-relaxed text-ink/80">{s.body}</p>
                <a href={s.source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-8 items-center text-[13px] text-muted-foreground underline-offset-4 hover:text-ink hover:underline">
                  {s.source.name} ↗
                </a>
              </div>
              {s.image && (
                <figure className="surface p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image.src} alt={s.image.alt} className="aspect-[4/5] w-full rounded-[11px] object-cover object-top" />
                  <figcaption className="px-1 pt-2 text-[11px] leading-snug text-muted-foreground">{s.image.credit}</figcaption>
                </figure>
              )}
            </Reveal>
          </li>
        ))}
      </ol>
      <Reveal className="surface mt-12 grid items-center gap-5 p-2 sm:grid-cols-[160px_minmax(0,1fr)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/drake.jpg" alt="Drake" className="aspect-square w-full rounded-[11px] object-cover object-top sm:aspect-[4/5]" />
        <div className="p-3 sm:p-4">
          <Kicker>Inspired by</Kicker>
          <p className="mt-2 text-[17px] leading-relaxed">
            Herman names <b>Drake</b> among his influences, alongside Wizkid, Burna Boy, Sarkodie and King Promise.
          </p>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            Sources: <a className="underline underline-offset-2" href="https://unorthodoxreviews.com/herman-suede" target="_blank" rel="noopener noreferrer">Unorthodox Reviews</a>,{" "}
            <a className="underline underline-offset-2" href="https://thevaultznews.com/2026/11/25/herman-suede-drops-new-single-she-get/" target="_blank" rel="noopener noreferrer">The Vaultz</a>. Photo: The Come Up Show, CC BY 2.0, via Wikimedia Commons. Drake is not affiliated with this site.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

async function Giveaway() {
  const [g, last] = await Promise.all([getOpenGiveaway(), getLastWinner()]);
  return (
    <section id="giveaway" className="mx-auto max-w-6xl px-6 pb-10 md:px-8 md:pb-16">
      <Reveal className="surface grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-8">
        {g ? (
          <>
            <div>
              <div className="flex items-center gap-2"><Kicker>Giveaway</Kicker>{g.sample && <Sample />}</div>
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(36px,4.6vw,60px)] leading-[0.95]">{g.title}</h2>
              <p className="mt-3 text-[17px]">Prize: {g.prize}</p>
              {g.details && <p className="mt-2 text-[15px] text-muted-foreground">{g.details}</p>}
              <p className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-[#edff00]">
                <Countdown endsAt={g.endsAt.toISOString()} />
              </p>
            </div>
            <div className="md:pt-8"><GiveawayForm id={g.id} sample={g.sample} /></div>
          </>
        ) : (
          <div>
            <Kicker>Giveaway</Kicker>
            <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(34px,4.4vw,56px)] leading-[0.95]">Next giveaway, coming soon.</h2>
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
    <section id="wall" className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:px-8 md:py-16">
      <div>
        <Kicker>The wall</Kicker>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(40px,5.4vw,72px)] leading-[0.95]">Howls from the pack</h2>
        <p className="mt-3 max-w-md text-[15px] text-muted-foreground">Notes from fans, picked by Herman&apos;s team. Yours could be next.</p>
        {posts.length === 0 ? (
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/75">The wall is waiting for its first howl.</p>
        ) : (
          <div className="mt-6 columns-1 gap-3 sm:columns-2 [&>*]:mb-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 6) * 0.04} className="surface break-inside-avoid p-5">
                <p className="text-[16px] leading-relaxed">“{p.message}”</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                  <span>{p.name}{p.city ? `, ${p.city}` : ""}{p.song ? ` · on ${p.song}` : ""}</span>
                  {p.sample && <Sample />}
                </div>
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
  const buy = (i: (typeof items)[number]) =>
    i.buyUrl ? (
      <a href={i.buyUrl} target="_blank" rel="noopener noreferrer" className="press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">
        Buy · <span className="num">{i.price}</span> <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    ) : (
      <BuyButton item={{ id: i.id, title: i.title, price: i.price, imageUrl: i.imageUrl, sizes: i.sizes, buyUrl: i.buyUrl, sample: i.sample, kind: i.kind, online: paymentsOn() && !!i.amount }} />
    );
  return (
    <section id="shop" className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-16">
      <Kicker>Shop</Kicker>
      <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(40px,5.4vw,72px)] leading-[0.95]">For the pack</h2>

      <h3 className="mt-10 text-lg font-semibold tracking-tight">Merch</h3>
      {merch.length === 0 ? (
        <p className="mt-2 text-[15px] text-muted-foreground">The first drop is on its way. Follow Herman to catch it.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {merch.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.05} className="surface flex flex-col p-2">
              {m.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.imageUrl} alt={`${m.title} design`} className="aspect-square w-full rounded-[11px] object-cover" />
              )}
              <div className="flex flex-1 flex-col p-3">
                <div className="flex items-center gap-2"><p className="text-lg font-semibold tracking-tight">{m.title}</p>{m.sample && <Sample />}</div>
                {m.description && <p className="mt-1 text-[14px] text-muted-foreground">{m.description}</p>}
                {m.sizes && <p className="mt-2 text-[13px] text-muted-foreground">Sizes: {m.sizes}</p>}
                <div className="mt-auto pt-4">{buy(m)}</div>
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
              <Reveal className="surface flex flex-wrap items-center gap-4 p-3">
                {u.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-[11px] object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="font-semibold">{u.title}</p>{u.sample && <Sample />}</div>
                  {u.description && <p className="text-[13px] text-muted-foreground">{u.description}</p>}
                  {u.previewUrl && <audio controls preload="none" src={u.previewUrl} className="mt-2 h-9 w-full max-w-sm" />}
                </div>
                {buy(u)}
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
