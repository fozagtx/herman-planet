import type { NoteKind } from "./types";

const KIND_BG: Record<NoteKind, string> = { sound: "#ffcf8a", lyrics: "#f6a19a", production: "#c9b7f2" };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function wrap(text: string, max = 16): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    if ((line + " " + w).trim().length > max && line) {
      out.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  return out.slice(0, 3);
}

/** A typographic cover for a timed note: no stock art, just the moment. */
export function momentCover(opts: { time: string; title: string; kind: NoteKind; label: string }) {
  const lines = wrap(opts.title)
    .map((l, i) => `<text x="36" y="${300 + i * 40}" font-size="34" font-weight="600" letter-spacing="-1">${esc(l)}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f7f7f5"/><rect x="0" y="0" width="400" height="190" fill="${KIND_BG[opts.kind]}"/><g fill="#1d1730" font-family="Helvetica, Arial, sans-serif"><text x="36" y="70" font-size="16" letter-spacing="3" opacity=".7">${esc(opts.label.toUpperCase())}</text><text x="32" y="160" font-size="88" font-weight="700" letter-spacing="-4">${esc(opts.time)}</text>${lines}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Word tiles for the hero marquee, in the three note colours. */
export function wordTile(word: string, kind: NoteKind) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${KIND_BG[kind]}"/><text x="36" y="356" font-family="Georgia, serif" font-size="74" fill="#1d1730" letter-spacing="-2">${esc(word)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
