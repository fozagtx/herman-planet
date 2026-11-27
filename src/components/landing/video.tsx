export function Video() {
  return (
    <section id="video" className="mx-auto w-full max-w-6xl px-6 py-24 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Video</p>
          <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(44px,6vw,80px)] leading-[0.95]">One by One</h2>
        </div>
        <p className="max-w-xs text-[15px] text-muted-foreground">Official music video. Produced by S.Kool Beatz, 2020.</p>
      </div>
      <div className="surface mt-8 overflow-hidden p-2">
        <div className="aspect-video overflow-hidden rounded-[13px] bg-ink">
          <iframe
            className="h-full w-full"
            src="https://www.youtube-nocookie.com/embed/SZ3F2IVGOZ0?rel=0"
            title="Herman Suede - One By One (Official Music Video)"
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
