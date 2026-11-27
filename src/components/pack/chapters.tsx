"use client";

import { BooksShowcase, type BookCfg } from "@/components/ui/books-showcase";
import { ImageTrail } from "@/components/ui/image-trail";
import { CATALOGUE, slugOf } from "@/lib/catalogue";

const art = (title: string) => CATALOGUE.find((c) => c.title === title)?.art;

// Each book is one chapter of how the pack was built. Facts match the sourced
// timeline on the Pack page; every book opens the song page for that era.
const CHAPTERS: { song: string; title: string; year: string; meta: string; desc: string; spine: string; ink: string }[] = [
  { song: "Pretty Mama", title: "The kid from Accra", year: "2018", meta: "Chapter 1", desc: "He is a teenager putting out singles. Then a first show abroad, at Ghana Party in the Park in London: “It felt surreal.”", spine: "#f6a19a", ink: "#1d1730" },
  { song: "Let Loose", title: "Hi I'm Herman", year: "2019", meta: "Chapter 2", desc: "His debut EP. After Prep, his own headline show, sells over 1,000 tickets. A meet-and-greet tour to 15 schools. Sarkodie puts him on “Womba”.", spine: "#ffcf8a", ink: "#1d1730" },
  { song: "One by One", title: "One by One", year: "2020", meta: "Chapter 3", desc: "The song that carried him through the quiet year, and the one The Therapist would later ask to remake.", spine: "#c9b7f2", ink: "#1d1730" },
  { song: "Naa Kwarley", title: "Bittersweet", year: "2021", meta: "Chapter 4", desc: "His second EP, nominated for EP of the Year at the 3 Music Awards.", spine: "#1d1730", ink: "#f7f7f5" },
  { song: "ONE BY ONE II", title: "ONE BY ONE II", year: "2025", meta: "Chapter 5", desc: "The Therapist hears One by One and insists on a verse. Herman opens for Victony at The Roxy in Hollywood along the way.", spine: "#edff00", ink: "#1d1730" },
  { song: "She Get", title: "Back in office", year: "2026", meta: "Chapter 6", desc: "A degree from Liberty University in May, after eight years of school and music. In November, She Get.", spine: "#f7f7f5", ink: "#1d1730" },
];

const BOOKS: BookCfg[] = CHAPTERS.map((c) => ({
  id: slugOf(c.song),
  title: c.title,
  author: "Herman Suede",
  year: c.year,
  stars: 0,
  meta: `${c.meta} · ${c.song}`,
  desc: c.desc,
  spineBg: c.spine,
  spineInk: c.ink,
  spineFont: "700 40px Georgia",
  backBg: c.spine,
  backInk: c.ink === "#f7f7f5" ? "247,247,245" : "29,23,48",
  edge: "#efeeea",
  images: { front: art(c.song) },
  links: [{ href: `/t/${slugOf(c.song)}`, label: `Hear ${c.song}` }],
}));

export function Chapters() {
  return (
    <div className="overflow-hidden rounded-[22px]">
      <BooksShowcase
        books={BOOKS}
        heroTitle="Chapters"
        navTitle="Tap a book to open it"
        className="h-[78svh] min-h-[560px] max-h-[820px]"
        themeColors={{
          navy: "#1d1730",
          pink: "#ffcf8a",
          cream: "#f7f7f5",
          lav: "#d9d2ea",
          peri: "#c9b7f2",
          bgLight: "#e6e5e0",
          bgDark: "#e6e5e0",
          foregroundLight: "#1d1730",
          foregroundDark: "#1d1730",
        }}
      />
    </div>
  );
}

const PICTURES = [
  { src: "/img/herman.jpg", alt: "Herman Suede" },
  ...CATALOGUE.slice(0, 8).map((c) => ({ src: c.art, alt: `${c.title} cover` })),
  { src: "/img/wolf.jpg", alt: "A grey wolf" },
  { src: "/img/sarkodie.jpg", alt: "Sarkodie" },
];

export function PictureTrail() {
  return (
    <ImageTrail
      images={PICTURES}
      threshold={70}
      duration={1100}
      maxItems={9}
      rotationRange={24}
      imageClassName="w-36 rounded-[11px] md:w-44"
      className="cursor-crosshair rounded-[22px] bg-ink text-surface"
    >
      <div className="flex min-h-[420px] flex-col justify-between gap-8 p-6 md:min-h-[520px] md:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-surface/60">Eight years in pictures</p>
        <div>
          <p className="max-w-3xl font-[family-name:var(--font-serif)] text-[clamp(44px,7vw,104px)] leading-[0.9]">
            Every cover, every era, <span className="text-[#ffcf8a]">one pack.</span>
          </p>
          <p className="mt-5 hidden text-[15px] text-surface/60 md:block">Move across to look back.</p>
        </div>
        {/* Phones scroll with a finger, so they get a strip instead of a trail. */}
        <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1 md:hidden">
          {PICTURES.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.src} src={p.src} alt={p.alt} className="aspect-[3/4] w-28 shrink-0 rounded-[11px] object-cover" />
          ))}
        </div>
      </div>
    </ImageTrail>
  );
}
