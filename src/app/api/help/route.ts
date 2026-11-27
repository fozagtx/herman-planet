import { CATALOGUE, slugOf } from "@/lib/catalogue";

// Turns a mood reading into one line of help and a link to a real place on the site.
// SERV Reasoning writes the line when SERV_API_KEY is set; otherwise, or if SERV
// fails, a built-in hint answers. The link is always picked from DESTINATIONS.

const MOODS = ["frustrated", "confused", "lost"] as const;
const FLOWS = ["buy", "book", "giveaway", "wall"] as const;
const FLOW_WHAT: Record<(typeof FLOWS)[number], string> = {
  buy: "ordering merch or unreleased music. The order sheet asks for a size (for clothes), quantity, name, email or phone, city, a tick box agreeing the team can contact them, and a choice between paying now with Bachs (card or mobile money) or having Herman's team contact them",
  book: "booking a show ticket or RSVPing to a meetup. The sheet asks for a name, the number of places, email or phone, a tick box agreeing the team can contact them, and for paid shows a choice between paying now with Bachs or having the team contact them",
  giveaway: "entering a giveaway with a name, email or phone and a tick box",
  wall: "posting a note on the fan wall with a name, city, the song, the note and a tick box",
};
const SIGNALS = ["invalid-entry", "failed-submit", "repeated-press", "dead-press", "disabled-press", "shake", "circling", "scroll-back-and-forth", "section-hopping"] as const;

const DESTINATIONS: { href: string; what: string }[] = [
  { href: "/#listen", what: "Listen: play Herman's music on the home page" },
  { href: "/#moods", what: "Pick songs by mood" },
  { href: "/#video", what: "Watch his videos" },
  { href: "/pack", what: "The Pack, Herman's fan community" },
  { href: "/pack#story", what: "How the pack was built, chapter by chapter" },
  { href: "/pack#events", what: "Shows and meetups: book tickets or RSVP" },
  { href: "/pack#giveaway", what: "Enter the current giveaway" },
  { href: "/pack#wall", what: "Leave a note on the fan wall" },
  { href: "/pack#shop", what: "Merch and unreleased music" },
  ...CATALOGUE.map((c) => ({ href: `/t/${slugOf(c.title)}`, what: `Song page for ${c.title}: full song, notes and credits` })),
];
const ALLOWED = new Set(DESTINATIONS.map((d) => d.href));

type Help = { hint: string; href: string | null; label: string | null; by: "serv" | "built-in" };

// Best effort per instance: enough to stop one browser from looping.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 6;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "Too many requests" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const mood = MOODS.find((m) => m === body.mood);
  const signal = SIGNALS.find((s) => s === body.signal);
  if (!mood || !signal) return Response.json({ error: "Bad request" }, { status: 400 });
  const path = clean(body.path, 80).startsWith("/") ? clean(body.path, 80) : "/";
  const target = clean(body.target, 40) || null;
  const section = clean(body.section, 30).replace(/[^a-z0-9-]/gi, "") || null;
  const flow = FLOWS.find((f) => f === body.flow) ?? null;
  const note = clean(body.note, 120) || null;

  const fallback = builtIn(mood, signal, path, section, target, flow, note);
  const key = process.env.SERV_API_KEY;
  if (!key) return Response.json(fallback);

  try {
    const help = await askServ(key, { mood, signal, path, section, target, flow, note });
    return Response.json(help ?? fallback);
  } catch (e) {
    console.error("help: SERV failed", (e as Error).message);
    return Response.json(fallback);
  }
}

async function askServ(key: string, r: { mood: string; signal: string; path: string; section: string | null; target: string | null; flow: (typeof FLOWS)[number] | null; note: string | null }): Promise<Help | null> {
  const res = await fetch("https://inference-api.openserv.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(12000), // SERV Reasoning takes around 6 s
    body: JSON.stringify({
      model: process.env.SERV_MODEL || "gpt-5.4-mini",
      max_completion_tokens: 400,
      messages: [
        {
          role: "system",
          content: [
            "You help fans on Herman Suede's website (Ghanaian afro-pop artist). A behaviour reader noticed someone struggling.",
            "Reply with JSON only: {\"hint\": string, \"href\": string | null, \"label\": string | null}.",
            "hint: one short, warm sentence (max 14 words) that helps with what they were trying to do. Plain words, no em dashes, no exclamation marks, never mention that you watched them or read their mood.",
            "href: the single best place from this list, or null if staying put is best:",
            ...DESTINATIONS.map((d) => `${d.href} = ${d.what}`),
            "label: 1 to 3 words for the button, like \"Book tickets\". null when href is null.",
            "If a button looks disabled, say what usually unlocks it (pick a size, fill the required fields, agree to the terms).",
            "What is on each page: / is the home page (play his music, the newest single She Get, a mood dial that picks songs, every release with its story, stream counts, videos, a teaser for The Pack). /pack is the fan community (story in chapters, shows and meetups with tickets, a giveaway, the fan wall, merch and unreleased music). /t/<song> is a song page (the full song, timed notes on how it was made, credits).",
            "When they are browsing (no flow), name one concrete, rewarding thing to do and always give an href for it. Never write vague advice like \"try the next step\" or \"look around\".",
            "If they are inside a flow (buying or booking), help them finish it right there: say the one thing to do next, and set href to null.",
            "signal invalid-entry means the browser refused a required field (control names it). failed-submit means the server said no; note is the exact message they saw, so explain how to fix it.",
            ...(r.flow ? [`They are ${FLOW_WHAT[r.flow]}.`] : []),
          ].join("\n"),
        },
        { role: "user", content: JSON.stringify({ page: r.path, section: r.section, control: r.target, mood: r.mood, signal: r.signal, flow: r.flow, note: r.note }) },
      ],
    }),
  });
  if (!res.ok) {
    console.error("help: SERV", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) return null;
  const out = JSON.parse(json);
  const hint = clean(out.hint, 140).replace(/\s[—–]\s/g, ", ");
  if (!hint) return null;
  // The model sometimes nests the link; accept the common shapes, keep only known pages.
  const rawHref = out.href ?? out.destination?.path ?? out.destination?.href ?? out.path ?? null;
  const rawLabel = out.label ?? out.destination?.label ?? null;
  const href = !r.flow && typeof rawHref === "string" && ALLOWED.has(rawHref) && rawHref !== r.path ? rawHref : null;
  return { hint, href, label: href ? clean(rawLabel, 24) || "Take me there" : null, by: "serv" };
}

function builtIn(mood: string, signal: string, path: string, section: string | null, target: string | null, flow: string | null, note: string | null): Help {
  const stay = (hint: string): Help => ({ hint, href: null, label: null, by: "built-in" });
  if (signal === "failed-submit" && note) return stay(`${note} Fix that and try again; your other details are still there.`);
  if (flow === "buy") {
    if (target && /size/i.test(target)) return stay("Pick your size first, then you can place the order.");
    if (signal === "invalid-entry") return stay(`${target ? `“${target}” is needed. ` : ""}Name, contact, city and the tick box are all required.`);
    return stay("Choose a size, add your details, tick the box, then pick how to pay.");
  }
  if (flow === "book") {
    if (signal === "invalid-entry") return stay(`${target ? `“${target}” is needed. ` : ""}Add your name and an email or phone, then tick the box.`);
    return stay("Your name, an email or phone, and the tick box are all it takes to save your place.");
  }
  if (flow === "giveaway") return stay("Add your name and an email or phone, tick the box, and you're in the draw.");
  if (flow === "wall") return stay("Write your note, pick the song, tick the box, and the team will read it.");
  const go = (href: string, label: string, hint: string): Help => ({ hint, href: href === path ? null : href, label: href === path ? null : label, by: "built-in" });
  if (signal === "disabled-press") return { hint: `${target ? `“${target}” is` : "That button is"} waiting on something above it. Check the fields and choices first.`, href: null, label: null, by: "built-in" };
  if (path.startsWith("/pack")) {
    if (section === "shop") return go("/pack#shop", "Shop", "Pick a size first, then choose how you want to pay.");
    if (section === "events") return go("/pack#events", "Shows", "Tap Get tickets or RSVP on a show to book your place.");
    if (mood === "lost") return go("/pack#events", "Shows", "Looking for tickets, merch or the giveaway? Shows are a good start.");
  }
  if (path.startsWith("/t/")) return go(path, "", "Tap a note on the timeline to jump to that moment in the song.");
  if (mood === "lost") return go("/pack", "The Pack", "Shows, merch and giveaways live in The Pack.");
  return go("/#listen", "Listen", "Want the music? Every song plays from here.");
}
