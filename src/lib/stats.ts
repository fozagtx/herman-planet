// Herman Suede on Spotify, read from his public artist page on 27 Nov 2026.
// Update by hand: Spotify's Web API no longer exposes play counts.
export const SPOTIFY_ARTIST = "https://open.spotify.com/artist/795E5FXQUgbjuPBxk6igGm";
export const APPLE_ARTIST = "https://music.apple.com/us/artist/herman-suede/1301306379";
export const STATS_AS_OF = "27 Nov 2026";
export const MONTHLY_LISTENERS = 17445;
export const TOP_PLAYS = [
  { title: "One by One", plays: 553954, href: "https://open.spotify.com/track/0mfwWliY4X4TlfOHGJ3gru" },
  { title: "ONE BY ONE II", plays: 191398, href: "https://open.spotify.com/track/3MHTjBkjMmDu1fYjNDAy7F" },
  { title: "Kumbaya", plays: 154001, href: SPOTIFY_ARTIST },
  { title: "Naa Kwarley", plays: 127404, href: SPOTIFY_ARTIST },
];
export const TOP_PLAYS_TOTAL = TOP_PLAYS.reduce((a, t) => a + t.plays, 0);

// Audiomack account total, from audiomack.com/hermansuede (27 Nov 2026): "2.48M Total Account Plays".
export const AUDIOMACK_PLAYS = 2_480_000;
export const AUDIOMACK_ARTIST = "https://audiomack.com/hermansuede";
/** A floor, not a total: Spotify's top four songs plus his Audiomack account. Other songs and platforms add more. */
export const PLAYS_AND_COUNTING = TOP_PLAYS_TOTAL + AUDIOMACK_PLAYS;
