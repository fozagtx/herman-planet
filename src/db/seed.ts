// Seeds placeholder content into Neon. Safe to re-run: existing rows are kept.
// Usage: npm run db:seed
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { seed } from "../lib/seed";
import { notes, tracks } from "./schema";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL });
  const db = drizzle(pool);
  await db.insert(tracks).values(seed.tracks).onConflictDoNothing();
  await db.insert(notes).values(seed.notes).onConflictDoNothing();
  console.log(`Seeded ${seed.tracks.length} track(s), ${seed.notes.length} note(s).`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
