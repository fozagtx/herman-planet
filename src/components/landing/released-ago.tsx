"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/** "Released 2 days ago", worked out in the visitor's browser so it never goes stale. */
export function ReleasedAgo({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => {
      const days = Math.floor((Date.now() - new Date(`${iso}T00:00:00Z`).getTime()) / 86_400_000);
      if (days <= 0) return "Released today";
      if (days === 1) return "Released yesterday";
      if (days < 14) return `Released ${days} days ago`;
      return `Released ${new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
    },
    () => "Released 25 Nov 2026",
  );
  return <span className="num">{text}</span>;
}
