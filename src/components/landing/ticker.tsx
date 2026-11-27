import Link from "next/link";

const ITEMS = ["She Get", "Out now", "New single from Herman Suede", "Produced by MILN and BNYX", "Listen now"];

/** Launch band for the new single: a running ticker that links to the song. */
export function Ticker() {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden>
      {ITEMS.map((t, i) => (
        <span key={i} className="flex items-center gap-8">
          <span className={i === 0 ? "font-[family-name:var(--font-serif)] text-[28px] leading-none md:text-[36px]" : "text-[13px] font-medium uppercase tracking-wider"}>{t}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#edff00]" />
        </span>
      ))}
    </div>
  );
  return (
    <Link href="/t/she-get" aria-label="She Get is out now. Listen." className="group block overflow-hidden bg-ink py-4 text-surface">
      <div className="ticker-track flex w-max">
        {row}
        {row}
        {row}
        {row}
      </div>
    </Link>
  );
}
