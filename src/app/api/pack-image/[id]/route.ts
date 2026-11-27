import { getImage } from "@/lib/pack";

// Serves a photo uploaded in Studio. Images never change once stored, so cache them hard.
export async function GET(_req: Request, ctx: RouteContext<"/api/pack-image/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const img = await getImage(id);
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "content-type": img.mime,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
