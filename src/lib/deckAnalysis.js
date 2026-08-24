import { CARDS_BY_ID } from "@/lib/cards";
import { totalOwned } from "@/lib/finishes";

// Cards banned from tournament play — flagged in the legality panel even
// though they're otherwise legal to log and own.
export const BANNED_IDS = ["PackAttack", "Sheeeesh"];

// Deck legality/have-need doesn't care which finish a copy is — a foil
// counts toward your playset the same as a regular copy.
export function ownedCount(collection, id) {
  return totalOwned(collection[id]);
}

export function deckTotal(deck) {
  return Object.values(deck.cards || {}).reduce((sum, n) => sum + n, 0);
}

export function deckCardIds(deck) {
  return Object.keys(deck.cards || {}).filter((k) => deck.cards[k] > 0);
}

// Mirrors the analysis logic from the original single-file version:
// legality (52-count, 4-copy cap), Fish-cost curve, rough pudge-coverage,
// have/need against a collection, and a priced buy list.
export function deckAnalysis(deck, collection, prices) {
  const ids = deckCardIds(deck);
  const totalCards = deckTotal(deck);
  const bannedInDeck = ids.filter((id) => BANNED_IDS.includes(id)).map((id) => CARDS_BY_ID[id]?.n).filter(Boolean);
  const overCap = [];
  const fishCurve = {};
  const neededColors = {};
  const haveColors = {};
  let have = 0;
  let need = 0;
  const needCards = [];
  let buyCost = 0;
  let unpriced = 0;

  ids.forEach((id) => {
    const c = CARDS_BY_ID[id];
    const qty = deck.cards[id];
    if (!c) return;
    if (qty > 4) overCap.push(c.n);

    const fishCost = c.c && c.c.color === "Fish" ? c.c.amount : null;
    if (fishCost !== null) {
      const bucket = fishCost >= 8 ? "8+" : String(fishCost);
      fishCurve[bucket] = (fishCurve[bucket] || 0) + qty;
    }
    if (c.c && c.c.color && c.c.color !== "Fish") neededColors[c.c.color] = true;
    if (c.t === "Character" && c.p && c.p.color && c.p.color !== "Colorless") {
      haveColors[c.p.color] = true;
    }

    const owned = ownedCount(collection, id);
    const haveN = Math.min(owned, qty);
    const needN = Math.max(0, qty - owned);
    have += haveN;
    need += needN;
    if (needN > 0) {
      const price = (prices && prices[id]) || 0;
      if (price === 0) unpriced += needN;
      else buyCost += price * needN;
      needCards.push({ id, card: c, needN, owned, qty, price });
    }
  });

  const missingColors = Object.keys(neededColors).filter((col) => !haveColors[col]);

  return {
    totalCards,
    isLegalCount: totalCards === 52,
    overCap,
    bannedInDeck,
    fishCurve,
    missingColors,
    have,
    need,
    needCards,
    buyCost,
    unpriced,
    readiness: totalCards > 0 ? Math.round((have / totalCards) * 100) : 0,
  };
}

export function shoppingListAcrossDecks(decks, collection, prices) {
  const agg = {};
  (decks || []).forEach((deck) => {
    const a = deckAnalysis(deck, collection, prices);
    a.needCards.forEach((row) => {
      if (!agg[row.id]) agg[row.id] = { card: row.card, need: 0, decks: [] };
      agg[row.id].need = Math.max(agg[row.id].need, row.needN);
      agg[row.id].decks.push(deck.name);
    });
  });
  let total = 0;
  Object.entries(agg).forEach(([id, e]) => {
    total += ((prices && prices[id]) || 0) * e.need;
  });
  return { agg, total };
}

export function fmtMoney(n) {
  return "₱" + n.toLocaleString();
}
