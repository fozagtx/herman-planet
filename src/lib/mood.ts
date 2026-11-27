// Reads how someone is using the page from pointer, press and scroll timing,
// and calls back when they look frustrated, confused or lost.
// It never reads typed text or field values; the only words it keeps are the
// label of the control under the pointer (a button's name), so help can say
// what it is about. Everything stays in the browser until a hint is asked for.

export type Mood = "frustrated" | "confused" | "lost";
export type Signal = "invalid-entry" | "failed-submit" | "repeated-press" | "dead-press" | "disabled-press" | "shake" | "circling" | "scroll-back-and-forth" | "section-hopping";
export type Flow = "buy" | "book" | "giveaway" | "wall";
export type MoodReading = { mood: Mood; signal: Signal; target: string | null; section: string | null; flow: Flow | null; note: string | null };
/** Forms call this when the server turns a submit down, with the message the fan saw. */
export const reportBlocked = (flow: Flow, message: string) => window.dispatchEvent(new CustomEvent("help:blocked", { detail: { flow, message } }));

const INTERACTIVE = "a,button,input,select,textarea,label,summary,[role=button],[role=link],[tabindex]:not([tabindex='-1'])";

type Point = { x: number; y: number; t: number };

function labelOf(el: Element | null): string | null {
  const hit = el?.closest(INTERACTIVE);
  if (!hit) return null;
  // Never the value of a field: only its accessible name.
  const named = hit.getAttribute("aria-label") || hit.getAttribute("title") || (hit instanceof HTMLInputElement || hit instanceof HTMLTextAreaElement || hit instanceof HTMLSelectElement ? hit.labels?.[0]?.textContent : hit.textContent);
  const s = (named ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  return s || null;
}

function sectionOf(el: Element | null): string | null {
  return el?.closest("section[id], [id][data-section]")?.id ?? null;
}

function isDisabled(el: Element | null) {
  const hit = el?.closest(INTERACTIVE);
  return !!hit && (hit.matches(":disabled") || hit.getAttribute("aria-disabled") === "true");
}

export function startMoodReader(onMood: (r: MoodReading) => void): () => void {
  const moves: Point[] = [];
  const presses: (Point & { dead: boolean })[] = [];
  const scrolls: { dir: number; t: number; y: number }[] = [];
  const sections: { id: string; t: number }[] = [];
  let lastScrollY = window.scrollY;
  let lastEl: Element | null = null;
  let lastFire = -Infinity;

  const fire = (mood: Mood, signal: Signal, el: Element | null = lastEl, extra: { flow?: Flow; note?: string } = {}) => {
    const now = performance.now();
    if (now - lastFire < 4000 || document.hidden) return;
    lastFire = now;
    // Clear the evidence so one episode fires once.
    moves.length = 0;
    presses.length = 0;
    scrolls.length = 0;
    const flow = extra.flow ?? ((el?.closest("[data-flow]")?.getAttribute("data-flow") as Flow | null) || null);
    onMood({ mood, signal, target: labelOf(el), section: sectionOf(el) ?? sections.at(-1)?.id ?? null, flow, note: extra.note ?? null });
  };

  const trim = <T extends { t: number }>(a: T[], ms: number) => {
    const cut = performance.now() - ms;
    while (a.length && a[0].t < cut) a.shift();
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const t = performance.now();
    moves.push({ x: e.clientX, y: e.clientY, t });
    trim(moves, 2000);
    lastEl = e.target as Element;
    if (moves.length < 12) return;

    // Shaking: the pointer flips direction many times, fast, in one second.
    let flips = 0;
    let prev = 0;
    const recent = moves.filter((m) => m.t > t - 1000);
    for (let i = 1; i < recent.length; i++) {
      const dx = recent[i].x - recent[i - 1].x;
      if (Math.abs(dx) < 6) continue;
      const s = Math.sign(dx);
      if (prev && s !== prev) flips++;
      prev = s;
    }
    if (flips >= 7) return fire("frustrated", "shake");

    // Circling: lots of travel that stays inside a small area.
    let path = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      if (i) path += Math.hypot(m.x - moves[i - 1].x, m.y - moves[i - 1].y);
      minX = Math.min(minX, m.x); maxX = Math.max(maxX, m.x);
      minY = Math.min(minY, m.y); maxY = Math.max(maxY, m.y);
    }
    const span = Math.max(maxX - minX, maxY - minY);
    if (path > 1400 && span < 180 && moves.at(-1)!.t - moves[0].t > 1500) fire("confused", "circling");
  };

  const onPress = (e: PointerEvent) => {
    const el = e.target as Element;
    lastEl = el;
    if (isDisabled(el)) return fire("frustrated", "disabled-press", el);
    const t = performance.now();
    const dead = !el.closest(INTERACTIVE);
    presses.push({ x: e.clientX, y: e.clientY, t, dead });
    trim(presses, 3000);
    const near = presses.filter((p) => p.t > t - 900 && Math.hypot(p.x - e.clientX, p.y - e.clientY) < 40);
    if (near.length >= 3) return fire("frustrated", "repeated-press", el);
    if (presses.filter((p) => p.dead).length >= 3) fire("frustrated", "dead-press", el);
  };

  const onScroll = () => {
    const y = window.scrollY;
    const dy = y - lastScrollY;
    if (Math.abs(dy) < 40) return;
    lastScrollY = y;
    const t = performance.now();
    const dir = Math.sign(dy);
    if (scrolls.at(-1)?.dir !== dir) scrolls.push({ dir, t, y });
    trim(scrolls, 10000);
    // Up and down, again and again, over more than a screen: looking for something.
    const travel = scrolls.length > 1 ? Math.max(...scrolls.map((s) => s.y)) - Math.min(...scrolls.map((s) => s.y)) : 0;
    if (scrolls.length >= 6 && travel > window.innerHeight * 1.2) fire("lost", "scroll-back-and-forth", document.elementFromPoint(innerWidth / 2, innerHeight / 2));
  };

  const onHash = () => {
    const id = location.hash.slice(1);
    if (!id) return;
    const t = performance.now();
    sections.push({ id, t });
    trim(sections, 20000);
    if (new Set(sections.map((s) => s.id)).size >= 4) {
      sections.length = 0;
      fire("lost", "section-hopping", document.getElementById(id));
    }
  };

  // A required field the browser refused: no size picked, contact missing, box not ticked.
  const onInvalid = (e: Event) => fire("frustrated", "invalid-entry", e.target as Element);
  const onBlocked = (e: Event) => {
    const d = (e as CustomEvent<{ flow: Flow; message: string }>).detail;
    lastFire = -Infinity; // the server said no: always worth a tip
    fire("frustrated", "failed-submit", lastEl, { flow: d.flow, note: d.message.slice(0, 120) });
  };

  document.addEventListener("invalid", onInvalid, true);
  window.addEventListener("help:blocked", onBlocked);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onPress, { passive: true, capture: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", onHash);
  return () => {
    document.removeEventListener("invalid", onInvalid, true);
    window.removeEventListener("help:blocked", onBlocked);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onPress, { capture: true });
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("hashchange", onHash);
  };
}
