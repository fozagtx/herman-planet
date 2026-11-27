# Troubleshooting

| Symptom | Fix |
|---|---|
| `/api/health` says unreachable | Check `DATABASE_URL`. Neon may be waking from idle; try again. |
| Studio keeps asking for the access code | `STUDIO_ACCESS_CODE` is not set in that environment, or it changed. |
| Buy only offers "Have the team contact me" | `BACHS_API_KEY` is not set, or the item has no amount. |
| Orders never turn Paid | Check the webhook URL, `BACHS_WEBHOOK_SECRET`, and that the endpoint listens for `checkout.completed` and `collection.succeeded`. |
| A song page plays only 30 seconds | The visitor is not signed in to Spotify. The page says so. |
| Share images point to localhost | Set `NEXT_PUBLIC_SITE_URL` and redeploy. |
| Photo upload fails | Use a JPG, PNG or WebP under 2.5 MB. |
| The intro plays every time | That is intended on a full page load. It skips when you move between pages inside the site, and for reduced motion. |
