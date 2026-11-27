"use client";

import { AwwwardsNav } from "@/components/ui/awwwards-nav";

export function Dock() {
  return (
    <AwwwardsNav
      className="bg-surface"
      items={[
        { label: "Listen", href: "/t/she-get" },
        { label: "Music", href: "#music" },
        { label: "The Pack", href: "/pack" },
      ]}
      moreLabel="More"
      columns={[
        {
          title: "Stream",
          links: [
            { label: "Spotify", href: "https://open.spotify.com/artist/795E5FXQUgbjuPBxk6igGm" },
            { label: "Apple Music", href: "https://music.apple.com/us/artist/herman-suede/1301306379" },
            { label: "YouTube", href: "https://www.youtube.com/HermanSuede" },
          ],
        },
        {
          title: "Follow",
          links: [
            { label: "Instagram", href: "https://www.instagram.com/hermansuede1/" },
            { label: "X", href: "https://x.com/hermansuede" },
            { label: "SoundCloud", href: "https://soundcloud.com/hermansuede" },
          ],
        },
      ]}
    />
  );
}
