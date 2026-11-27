# Configuration

All settings are environment variables. Put them in `.env.local` on your machine and in the Vercel project settings for production. `.env.local` is in `.gitignore`; never commit it.

| Variable | Required | What it does |
|---|---|---|
| `DATABASE_URL` | Yes | Neon pooled connection string. Use `sslmode=verify-full`. |
| `DATABASE_URL_UNPOOLED` | Yes | Neon direct connection string, used by migrations and seed scripts. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public address of the site, for example `https://herman-planet.vercel.app`. Used for share images and for where Bachs sends fans after checkout. |
| `STUDIO_ACCESS_CODE` | Yes | The access code for Studio, the team's admin. See below. |
| `BACHS_API_KEY` | For payments | Your Bachs secret key. `sk_sandbox_` keys test without real money, `sk_live_` keys take real payments. |
| `BACHS_WEBHOOK_SECRET` | For payments | The signing secret of your Bachs webhook endpoint. |

Values that start with `NEXT_PUBLIC_` are built into the site, so redeploy after you change one.

## The Studio access code

Studio is where Herman's team and staff run the site: uploading merch photos, pricing items, managing shows and bookings, running giveaways, approving notes and fan wall posts. It is protected by one shared access code.

**For the live demo site:** the access code is in [ACCESS.md](../ACCESS.md) at the root of this repository. Only people with access to this private repository can read it.

**For your own copy:** choose any code you like and set it as `STUDIO_ACCESS_CODE`. A long random code is safest:

```bash
openssl rand -base64 18
```

How it protects the admin:

1. Every Studio page shows only the access screen until the right code is entered.
2. Every admin action checks the code again on the server, so knowing the URL is not enough.
3. Wrong codes are slowed down by 1.5 seconds each, which makes guessing impractical.
4. The browser keeps a signed session cookie for 14 days. The cookie holds a hash of the code, never the code itself.
5. Changing `STUDIO_ACCESS_CODE` and redeploying signs everyone out.

`STUDIO_PASSCODE` is accepted as an older name for the same setting.
