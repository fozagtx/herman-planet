# Deployment

The live site runs on Vercel with a Neon database. These steps put your own copy online.

1. Import the repository in [Vercel](https://vercel.com/new), or run `vercel link` in the project folder.
2. In Vercel, Project, Settings, Environment Variables, add every variable from [Configuration](configuration.md) for Production.
3. Run the migrations once against the production database. Point `.env.local` at it, then:

```bash
npm run db:migrate
npm run db:seed
```

4. Deploy by pushing to `main`, or:

```bash
vercel deploy --prod
```

5. Check these addresses on your domain:

| Address | Expect |
|---|---|
| `/api/health` | `{"status":"ok","database":"connected"}` |
| `/` | The home page with the intro |
| `/pack` | The Pack |
| `/studio` | The team access screen |

6. If you use payments, finish [Payments with Bachs](payments-bachs.md), including the webhook URL on your domain.

Redeploy after changing any `NEXT_PUBLIC_` variable, because those are built into the site.
