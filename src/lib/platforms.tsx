import type { IconType } from "react-icons";
import { SiApplemusic, SiAudiomack, SiInstagram, SiSoundcloud, SiSpotify, SiX, SiYoutube } from "react-icons/si";

export type Platform = { label: string; href: string; Icon: IconType };

// Herman's official profiles. Each URL checked to return 200 on 27 Nov 2026.
export const PLATFORMS: Platform[] = [
  { label: "Spotify", href: "https://open.spotify.com/artist/795E5FXQUgbjuPBxk6igGm", Icon: SiSpotify },
  { label: "Apple Music", href: "https://music.apple.com/us/artist/herman-suede/1301306379", Icon: SiApplemusic },
  { label: "YouTube", href: "https://www.youtube.com/HermanSuede", Icon: SiYoutube },
  { label: "Instagram", href: "https://www.instagram.com/hermansuede1/", Icon: SiInstagram },
  { label: "X", href: "https://x.com/hermansuede", Icon: SiX },
  { label: "SoundCloud", href: "https://soundcloud.com/hermansuede", Icon: SiSoundcloud },
  { label: "Audiomack", href: "https://audiomack.com/hermansuede", Icon: SiAudiomack },
];

const ICONS: Record<string, IconType> = Object.fromEntries(PLATFORMS.map((p) => [p.label, p.Icon]));

/** Brand mark for a platform name, e.g. on a release link. */
export function PlatformIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const Icon = ICONS[name];
  return Icon ? <Icon className={className} aria-hidden /> : null;
}
