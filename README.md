# Huddle Ledger

A collection tracker and decklist manager for [Vibes TCG](https://www.vibes.game) (the Pudgy Penguins trading card game). Track what you own, build decks, see what's missing to complete each list, and spot cards you have spare to trade.

## Features

- **Collection** — search the full 547-card pool, set how many copies you own (no cap at 4 — extras beyond a playset show as spare, for trading).
- **Decks** — create named decklists, add cards, see a readiness % against your collection.
- **Per-deck detail** — legality check (52-count, 4-copy cap), a Fish-cost curve, a rough pudge-coverage check, and a Have/Need breakdown.
- **Buy list + cross-deck shopping list** — deduplicates what's missing across every tracked deck, with manual per-card pricing.
- **No accounts, honor-system pages** — pick a name, get a page at `/p/your-name`. Anyone with the link can view (and, since there's no login, edit) — meant for a friend group, not the public internet.

## Local development

```bash
npm install
npm run dev
```

Without any database configured, data is saved to a local `.local-data/store.json` file — good enough for development, not for production (it won't survive a redeploy).

**Don't run `vercel env pull`** for routine local dev — it downloads the *real* production Redis credentials into `.env.local`, and once those are present `npm run dev` starts writing to the live production database instead of the local file fallback. If you ever do need real data locally (debugging a production-only issue), delete `.env.local` again as soon as you're done.

## Deploying

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Import it into [Vercel](https://vercel.com/new).
3. Add a Redis database from the Vercel Marketplace (Storage tab → Redis, e.g. Upstash) and connect it to this project — this sets the `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars automatically.
4. Deploy. Without step 3, the app still runs but nothing will persist between requests in production (serverless functions don't share a local filesystem).

## Card data

The card database (`src/data/cards.json`) is a lean snapshot (id, name, color, type, rarity, vibe, cost, pudge) of the public card pool — no rules text, kept small on purpose.
