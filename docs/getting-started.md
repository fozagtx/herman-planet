# Getting started

You need Node.js 22 or later, npm, and a free Neon account at [neon.com](https://neon.com).

## 1. Get the code

```bash
git clone https://github.com/fozagtx/herman-planet.git
cd herman-planet
npm install
```

The repository is private. Ask the owner to add your GitHub account if the clone is refused.

## 2. Create the database

1. Create a project in the Neon console.
2. Copy two connection strings from Connect: the pooled one (its host contains `-pooler`) and the direct one.
3. Copy the example settings file and fill it in:

```bash
cp .env.example .env.local
```

See [Configuration](configuration.md) for every value.

## 3. Create the tables and add content

```bash
npm run db:migrate      # creates every table
npm run db:seed         # She Get, its credits and its timed notes
npm run db:seed-pack    # optional: sample shop items, a giveaway, a show, a meetup
```

Sample content is tagged "Sample" on the site, is never charged, and can be removed in one click from Studio.

## 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Check [http://localhost:3000/api/health](http://localhost:3000/api/health) returns `"database":"connected"`.

Open [http://localhost:3000/studio](http://localhost:3000/studio) and enter the access code you set as `STUDIO_ACCESS_CODE`.

## 5. Optional: payments

Payments are off until you add Bachs keys. Fans can still order and book; the team follows up. To turn card and mobile money on, follow [Payments with Bachs](payments-bachs.md).
