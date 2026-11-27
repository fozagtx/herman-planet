"use client";

import { AwwwardsNav } from "@/components/ui/awwwards-nav";

export function Dock() {
  return (
    <AwwwardsNav
      className="bg-surface"
      items={[
        { label: "Listen", href: "/t/she-get/m/42" },
        { label: "Studio", href: "/studio" },
        { label: "Demand", href: "/team" },
      ]}
      moreLabel="More"
      columns={[
        { title: "For fans", links: [{ label: "Play from the hook", href: "/t/she-get/m/42" }, { label: "Whole track", href: "/t/she-get" }] },
        { title: "For Herman's team", links: [{ label: "Approve notes", href: "/studio" }, { label: "Fan demand by city", href: "/team" }] },
        { title: "For promoters", links: [{ label: "Export demand (CSV)", href: "/team/export" }] },
      ]}
    />
  );
}
