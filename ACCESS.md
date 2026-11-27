# Studio access

Studio is the private admin where Herman's team and staff upload merch photos, price and list items, manage shows and bookings, run giveaways, approve notes and moderate the fan wall.

## Live demo

| | |
|---|---|
| Address | https://herman-planet.vercel.app/studio |
| Access code | `PASTE THE TEAM ACCESS CODE HERE` |

1. Open the address above.
2. Enter the access code and press **Enter Studio**.
3. Open **The Pack** at the top of Studio for merch, orders, shows, giveaways and the fan wall.

The repository is private. Anyone who has this code can change what fans see, so share it only with Herman's team and staff, and change it before real fans and real payments use the site.

## Your own copy

When you deploy your own copy, choose any code you want:

```bash
openssl rand -base64 18        # makes a strong random code
```

Put it in `STUDIO_ACCESS_CODE` in `.env.local` and in your Vercel project, then redeploy. Changing it signs everyone out. Details are in [docs/configuration.md](docs/configuration.md).
