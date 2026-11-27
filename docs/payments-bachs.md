# Payments with Bachs

Herman Planet takes payments for merch and show tickets through [Bachs](https://bachs.io), a payments platform for internet businesses that supports cards and mobile money (including MTN MoMo in Ghana, `MOMO_GHS`). This guide covers signing up, keys, the webhook, how the site uses the API, testing, and going live.

Payments are optional. Without Bachs keys, fans can still order and book, and Herman's team contacts them to arrange payment.

## Useful links

| What | Link |
|---|---|
| Bachs website | [bachs.io](https://bachs.io) |
| Create an account | [app.bachs.io/signup](https://app.bachs.io/signup) |
| Dashboard | [app.bachs.io](https://app.bachs.io) |
| Documentation | [docs.bachs.io](https://docs.bachs.io) |
| API keys and authentication | [docs.bachs.io/authentication](https://docs.bachs.io/authentication) |
| Accept a payment with Checkout | [docs.bachs.io/guides/checkout/checkout-sessions](https://docs.bachs.io/guides/checkout/checkout-sessions) |
| Payment methods | [docs.bachs.io/guides/payments/payment-method-support](https://docs.bachs.io/guides/payments/payment-method-support) |
| Node.js SDK | [docs.bachs.io/sdks/node](https://docs.bachs.io/sdks/node) |
| API reference | [docs.bachs.io/api-reference](https://docs.bachs.io/api-reference) |
| SDK announcement | [bachs.io/blog/bachs-sdks-nodejs-python](https://bachs.io/blog/bachs-sdks-nodejs-python) |

## 1. Create a Bachs account

Sign up at [app.bachs.io/signup](https://app.bachs.io/signup). Sandbox keys work straight away. Live keys work once Bachs has verified your account.

## 2. Create a sandbox API key

1. In the dashboard, open **Developer Portal** at the bottom of the sidebar, then **API keys**.
2. Switch to the sandbox, then click **Create secret key**.
3. Name it, for example `herman-planet-checkout`.
4. Tick the scopes it needs: **payments read** and **payments write** (shown as View payments and Create and charge). Nothing else is required.
5. Copy the key. It is shown once only. It starts with `sk_sandbox_`.

Keep keys out of the browser, logs, screenshots and source control. This app only uses the key on the server.

## 3. Add the key

In `.env.local` and in Vercel (Project, Settings, Environment Variables):

```text
BACHS_API_KEY=sk_sandbox_your_key
```

The key decides the environment: `sk_sandbox_` talks to `https://sandbox-api.bachs.io` and moves no real money, `sk_live_` talks to `https://api.bachs.io`. The SDK picks the right one from the key.

## 4. Add the webhook

Bachs tells the site a payment succeeded by calling a webhook. The site trusts only this, or a direct status check with Bachs, never the browser.

1. In the Developer Portal, add a webhook endpoint with the URL `https://<your-domain>/api/webhooks/bachs`. For the live demo that is `https://herman-planet.vercel.app/api/webhooks/bachs`.
2. Subscribe it to `checkout.completed` and `collection.succeeded`.
3. Copy the endpoint's signing secret and set it:

```text
BACHS_WEBHOOK_SECRET=your_signing_secret
```

4. Redeploy so the new variables take effect.

Until the secret is set, the endpoint answers `503 Webhook not configured`.

## 5. Price items and events in Studio

Open Studio, then The Pack. For each merch item, unreleased song or show, fill in:

| Field | Example | Meaning |
|---|---|---|
| Price shown | `GH₵ 250` | What fans read on the page |
| Amount charged with Bachs | `250.00` | What Bachs charges per unit, as a decimal |
| Currency | `GHS` | ISO currency code |

An item or event without an amount can still be ordered or booked, but only through "Have Herman's team contact me".

## How a payment flows

```text
            Fan presses Buy or Get tickets
                          |
                          v
   Pay now with Bachs              Have the team contact me
          |                                   |
          v                                   v
   Site saves the order or ticket      Order held; the team
   and creates a Bachs checkout        follows up from Studio
          |
          v
   Fan pays on the Bachs checkout (card or mobile money)
          |
          v
   Bachs calls /api/webhooks/bachs     Fan returns to the result page
   (checkout.completed,                and the site asks Bachs for
    collection.succeeded)              the checkout status
          |                                   |
          v                                   v
             Order or ticket marked Paid in Studio
```

What the site sends to Bachs when it creates a checkout (`src/app/pack-actions.ts` and `src/app/event-actions.ts`):

| Field | Value |
|---|---|
| `pricing` | `{ currency, amount: unit × quantity, price_type: "fixed" }` |
| `customer` | The fan's email and name, when they gave an email |
| `reference` | The order or ticket id |
| `metadata` | Item or event name, size, quantity, and `kind: "ticket"` for tickets |
| `success_url` | `/pack/order/<id>` or `/pack/ticket/<id>` |
| `cancel_url` | Back to the shop or the events section |
| Idempotency key | `checkout-<order id>` or `ticket-<ticket id>`, so a retry never creates a second checkout |

What the webhook does (`src/app/api/webhooks/bachs/route.ts`):

1. Verifies the signature on the raw request body with `BACHS_WEBHOOK_SECRET`. Bad signatures get `400`.
2. Acts only on `checkout.completed` and on `collection.succeeded` with status `SUCCEEDED`.
3. Finds the order or ticket by `data.checkout_id`.
4. Checks the amount paid equals unit amount × quantity.
5. Marks it Paid. It only moves forward, so the second event for the same checkout changes nothing.

Sample items and events never create a checkout and are never charged.

## Test in the sandbox

1. Use an `sk_sandbox_` key and its webhook secret.
2. Give a non sample item an amount, put it in the shop, and buy it from `/pack`.
3. Pay on the Bachs sandbox checkout. No real money moves.
4. Check Studio, The Pack, Orders: the order shows **Paid online**.
5. To test failures, see Test your integration in the [Bachs docs](https://docs.bachs.io).

## Go live

1. Get your Bachs account verified.
2. Create a live key (`sk_live_`) with the same scopes, and a live webhook endpoint with the same URL.
3. Replace `BACHS_API_KEY` and `BACHS_WEBHOOK_SECRET` in Vercel and redeploy. No code changes.

## When something goes wrong

| Symptom | Likely cause |
|---|---|
| Buy only offers "Have the team contact me" | `BACHS_API_KEY` is not set, or the item has no amount |
| Checkout fails and the fan sees "online payment isn't available right now" | Wrong key, missing scopes (`403`), or a sandbox key used with a live setup (`401`). The order is still held for the team |
| Orders never turn Paid | Webhook URL or secret wrong, or the endpoint is not subscribed to `checkout.completed` and `collection.succeeded` |
| Server log says "amount mismatch" | The amount in Studio was changed after the fan started checkout. Check the payment in the Bachs dashboard and mark it by hand |
