export type NoteKind = "sound" | "lyrics" | "production";
export type NoteStatus = "draft" | "in_review" | "approved";

export type Stem = { id: string; label: string; src: string };

export type Note = {
  id: string;
  trackSlug: string;
  t: number; // seconds into the track
  kind: NoteKind;
  title: string;
  body: string;
  credits: string[];
  /** Stem ids to solo when the fan taps "Hear the layer". */
  layers?: string[];
  status: NoteStatus;
  approvedBy?: string;
  approvedAt?: string;
  /** True until Herman's team replaces the text. */
  placeholder: boolean;
};

export type ReleaseLink = { platform: string; href: string | null };

export type Track = {
  slug: string;
  title: string;
  artist: string;
  year: string;
  duration: number;
  hookAt: number;
  stems: Stem[];
  credits: { role: string; name: string }[];
  releases: ReleaseLink[];
  related: { slug: string | null; href?: string; title: string; why: string }[];
  liveUpdate: { approved: boolean; title: string; body: string } | null;
  placeholderMedia: boolean;
  /** Official Spotify track: when set, the page plays the real song via the Spotify embed. */
  spotifyTrackId?: string | null;
  /** Official 30s preview (Apple). */
  previewUrl?: string | null;
  artworkUrl?: string | null;
  /** What inspired it (published source), shown when the team hasn't written timed notes. */
  story?: { text: string; madeBy?: string; source?: { name: string; url: string } } | null;
  /** True when only Apple's 30 second preview plays here. */
  previewOnly?: boolean;
};

export type Follow = {
  id: string;
  trackSlug: string;
  momentT: number | null;
  contact: string;
  city: string;
  ticketIntent: boolean;
  consent: boolean;
  createdAt: string;
};

export type Store = { tracks: Track[]; notes: Note[]; follows: Follow[] };
