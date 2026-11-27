import { getFollows } from "@/lib/store";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`;

// Contacts are omitted: promoters get demand, not fans' personal details.
export async function GET() {
  const follows = await getFollows();
  const lines = [
    ["city", "track", "moment_seconds", "ticket_intent", "created_at"].join(","),
    ...follows.map((f) => [f.city, f.trackSlug, f.momentT, f.ticketIntent, f.createdAt].map(esc).join(",")),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="herman-fan-demand.csv"',
    },
  });
}
