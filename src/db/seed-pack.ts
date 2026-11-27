// Sample data for the Pack, so the team can see how it works. Every row is
// flagged sample = true, tagged "Sample" on the site, and removed in one click
// from Studio → The Pack. Usage: npm run db:seed-pack
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { events, giveaways, packItems, packPosts } from "./schema";

const SHE_GET_ART = "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f1/0b/45/f10b4518-97a4-e002-a624-1ca898aa5f64/823375590934_Cover.jpg/600x600bb.jpg";
const ONE_BY_ONE_ART = "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/10/3f/14/103f144f-bcd1-6e57-af10-a188e1655c9b/artwork.jpg/600x600bb.jpg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL });
  const db = drizzle(pool);
  const sampleEvents = await db.select().from(events).where(eq(events.sample, true));
  if (!sampleEvents.length) {
    const day = (n: number, h: number) => { const d = new Date(Date.now() + n * 86_400_000); d.setUTCHours(h, 0, 0, 0); return d; };
    await db.insert(events).values([
      { kind: "show", title: "She Get release show", venue: "Venue to be announced", city: "Accra", startsAt: day(21, 20), details: "Herman performs She Get live, plus the songs that built the pack.", imageUrl: SHE_GET_ART, price: "GH₵ 150", amount: "150.00", currency: "GHS", capacity: 300, status: "live", sample: true },
      { kind: "meetup", title: "Pack meetup", venue: "Location sent to RSVPs", city: "Accra", startsAt: day(10, 16), details: "Hang out with Herman and the pack. Free, limited places.", imageUrl: "/img/herman.jpg", price: null, amount: null, currency: "GHS", capacity: 50, status: "live", sample: true },
    ]);
    console.log("Seeded sample show and meetup.");
  }
  const existing = await db.select().from(packItems).where(eq(packItems.sample, true));
  if (existing.length) {
    console.log("Sample wall, shop and giveaway already seeded.");
    await pool.end();
    return;
  }
  await db.insert(packPosts).values([
    { name: "Sample fan", city: "Accra", song: "She Get", message: "The Ga intro had me from the first second. Welcome back, Herman.", status: "featured", consent: true, sample: true },
    { name: "Sample fan", city: "Kumasi", song: "One by One", message: "One by One was the soundtrack to my final year. Still on repeat.", status: "featured", consent: true, sample: true },
    { name: "Sample fan", city: "London", song: "Naa Kwarley", message: "Saw you at Ghana Party in the Park and never stopped listening.", status: "featured", consent: true, sample: true },
    { name: "Sample fan", city: "Lagos", song: "Kumbaya", message: "Kumbaya got me through a hard month. Thank you.", status: "pending", consent: true, sample: true },
  ]);
  await db.insert(packItems).values([
    { kind: "merch", title: "She Get tee", description: "Heavy black tee with the She Get cover on the back.", price: "GH₵ 250", imageUrl: SHE_GET_ART, sizes: "S, M, L, XL", status: "live", sample: true },
    { kind: "merch", title: "Lone Wolf hoodie", description: "Black hoodie with the wolf on the chest. For the pack.", price: "GH₵ 450", imageUrl: "/img/wolf.jpg", sizes: "S, M, L, XL", status: "live", sample: true },
    { kind: "merch", title: "One by One poster", description: "A2 print of the One by One cover.", price: "GH₵ 120", imageUrl: ONE_BY_ONE_ART, sizes: null, status: "live", sample: true },
    { kind: "unreleased", title: "Unreleased demo, title to come", description: "An early demo from the vault, for the pack first.", price: "GH₵ 50", imageUrl: "/img/herman.jpg", sizes: null, status: "live", sample: true },
  ]);
  await db.insert(giveaways).values({
    title: "She Get launch giveaway",
    prize: "A signed She Get poster and a video call with Herman",
    details: "Enter once. A random winner is drawn when the countdown ends.",
    endsAt: new Date(Date.now() + 7 * 86_400_000),
    status: "live",
    sample: true,
  });
  console.log("Seeded sample wall notes, shop items and a giveaway.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
