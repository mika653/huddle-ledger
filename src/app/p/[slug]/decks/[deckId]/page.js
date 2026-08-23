"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PersonShell from "@/components/PersonShell";
import { usePersonState } from "@/lib/usePersonState";
import { deckAnalysis, deckCardIds, ownedCount, fmtMoney } from "@/lib/deckAnalysis";
import { CARDS_BY_ID, COLOR_HEX, costLabel, searchCards } from "@/lib/cards";

function CurveChart({ curve }) {
  const buckets = ["0", "1", "2", "3", "4", "5", "6", "7", "8+"];
  const max = Math.max(1, ...buckets.map((b) => curve[b] || 0));
  return (
    <div style={{ marginTop: 14 }}>
      <div className="kv-label" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>Fish-cost curve</div>
      <div className="curve-bars">
        {buckets.map((b) => {
          const v = curve[b] || 0;
          const h = Math.round((v / max) * 60) + (v ? 2 : 0);
          return (
            <div className="curve-col" key={b}>
              <div className="curve-bar" style={{ height: h, opacity: v ? 1 : 0.15 }} />
              <div className="curve-label">{b}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DeckDetailPage({ params }) {
  const { slug, deckId } = use(params);
  const router = useRouter();
  const { state, update, loading, saveStatus } = usePersonState(slug);
  const [tab, setTab] = useState("cards");
  const [query, setQuery] = useState("");

  const deck = state.decks.find((d) => d.id === deckId);

  const a = useMemo(() => (deck ? deckAnalysis(deck, state.collection, state.prices) : null), [deck, state.collection, state.prices]);

  function mutateDeck(fn) {
    update((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => (d.id === deckId ? fn(d) : d)),
    }));
  }

  function setQty(id, qty) {
    mutateDeck((d) => {
      const cards = { ...d.cards };
      if (qty <= 0) delete cards[id];
      else cards[id] = Math.min(4, qty);
      return { ...d, cards };
    });
  }

  function rename() {
    const next = prompt("Rename deck", deck.name);
    if (next && next.trim()) {
      mutateDeck((d) => ({ ...d, name: next.trim() }));
    }
  }

  function remove() {
    if (!confirm(`Delete "${deck.name}"? This can't be undone.`)) return;
    update((prev) => ({ ...prev, decks: prev.decks.filter((d) => d.id !== deckId) }));
    router.push(`/p/${slug}/decks`);
  }

  function setPrice(id, value) {
    const v = Math.max(0, Math.round(Number(value) || 0));
    update((prev) => {
      const prices = { ...prev.prices };
      if (v === 0) delete prices[id];
      else prices[id] = v;
      return { ...prev, prices };
    });
  }

  if (loading) {
    return (
      <PersonShell slug={slug} saveStatus={saveStatus}>
        <div className="empty-state"><h3>Loading…</h3></div>
      </PersonShell>
    );
  }
  if (!deck) {
    return (
      <PersonShell slug={slug} saveStatus={saveStatus}>
        <div className="empty-state">
          <h3>Deck not found</h3>
          <p><a href={`/p/${slug}/decks`}>Back to decks</a></p>
        </div>
      </PersonShell>
    );
  }

  const ids = deckCardIds(deck).sort((x, y) => CARDS_BY_ID[x].n.localeCompare(CARDS_BY_ID[y].n));
  const results = query.trim() ? searchCards(query, 8) : [];

  return (
    <PersonShell slug={slug} saveStatus={saveStatus}>
      <div className="page-head">
        <div>
          <h1>{deck.name}</h1>
          <p>
            {a.totalCards} / 52 cards ·{" "}
            {a.isLegalCount ? (
              <span className="chip chip-good">Legal count</span>
            ) : (
              <span className="chip chip-bad">{a.totalCards > 52 ? "Over" : "Under"} by {Math.abs(52 - a.totalCards)}</span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={rename}>Rename</button>
          <button className="btn btn-ghost" onClick={remove}>Delete</button>
        </div>
      </div>

      <div className="tabbar">
        <button className={"tab" + (tab === "cards" ? " active" : "")} onClick={() => setTab("cards")}>Cards</button>
        <button className={"tab" + (tab === "buy" ? " active" : "")} onClick={() => setTab("buy")}>Buy list ({a.needCards.length})</button>
      </div>

      <div className="grid-2">
        <div>
          {tab === "buy" ? (
            a.needCards.length === 0 ? (
              <div className="table-wrap"><div className="empty-state"><h3>Nothing to buy</h3><p>You own enough of everything in this deck.</p></div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Card</th><th className="num">Own / need</th><th className="num">Short</th><th className="num">Price ea.</th><th className="num">Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {[...a.needCards].sort((x, y) => y.needN - x.needN).map((row) => (
                      <tr key={row.id}>
                        <td>
                          <div className="card-name-cell">
                            <span className="swatch" style={{ background: COLOR_HEX[row.card.co] || "var(--c-colorless)" }} />
                            <span className="card-name">{row.card.n}</span>
                          </div>
                        </td>
                        <td className="num">{row.owned} / {row.qty}</td>
                        <td className="num" style={{ color: "var(--bad)", fontWeight: 700 }}>{row.needN}</td>
                        <td className="num">
                          <input className="price-input" type="number" min="0" step="1" defaultValue={row.price || ""} placeholder="0"
                            onBlur={(e) => setPrice(row.id, e.target.value)} />
                        </td>
                        <td className="num">{row.price ? fmtMoney(row.price * row.needN) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <>
              <div className="search-box">
                <input type="text" placeholder="Add a card to this deck…" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
              </div>
              {results.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {results.map((c) => {
                    const qty = deck.cards[c.id] || 0;
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 8, marginBottom: 6, background: "var(--surface)" }}>
                        <div className="card-name-cell">
                          <span className="swatch" style={{ background: COLOR_HEX[c.co] || "var(--c-colorless)" }} />
                          <span className="card-name">{c.n}</span>
                        </div>
                        <button className="btn btn-sm btn-accent" disabled={qty >= 4} onClick={() => setQty(c.id, qty + 1)}>
                          {qty ? `Add another (${qty}/4)` : "Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ marginTop: 16 }} className="table-wrap">
                <table>
                  <thead><tr><th>Card</th><th className="num">Cost</th><th className="num">Own</th><th className="num">In deck</th></tr></thead>
                  <tbody>
                    {ids.length === 0 ? (
                      <tr><td colSpan={4}><div className="empty-state"><h3>Empty deck</h3><p>Use the search box above to add cards.</p></div></td></tr>
                    ) : (
                      ids.map((id) => {
                        const c = CARDS_BY_ID[id];
                        const qty = deck.cards[id];
                        const owned = ownedCount(state.collection, id);
                        const short = qty > owned;
                        return (
                          <tr key={id}>
                            <td>
                              <div className="card-name-cell">
                                <span className="swatch" style={{ background: COLOR_HEX[c.co] || "var(--c-colorless)" }} />
                                <span className="card-name">{c.n}</span>
                              </div>
                            </td>
                            <td className="num">{costLabel(c.c)}</td>
                            <td className="num">{owned}</td>
                            <td className="num">
                              <div className="stepper">
                                <button onClick={() => setQty(id, qty - 1)}>−</button>
                                <span className="count" style={short ? { color: "var(--bad)" } : undefined}>{qty}</span>
                                <button disabled={qty >= 4} onClick={() => setQty(id, qty + 1)}>+</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div>
          <div className="panel">
            <h3>Legality &amp; curve</h3>
            <div className="kv-row"><span className="kv-label">Total cards</span><span className="kv-value">{a.totalCards} / 52</span></div>
            <div className="kv-row">
              <span className="kv-label">Over 4 copies</span>
              <span className="kv-value">{a.overCap.length ? <span className="chip chip-bad">{a.overCap.length}</span> : <span className="chip chip-good">None</span>}</span>
            </div>
            <div className="kv-row">
              <span className="kv-label">Pudge coverage</span>
              <span className="kv-value">
                {a.missingColors.length ? (
                  <span className="chip chip-warn" title="Colored costs with no matching producer in this deck">{a.missingColors.join(", ")}</span>
                ) : (
                  <span className="chip chip-good">Covered</span>
                )}
              </span>
            </div>
            <CurveChart curve={a.fishCurve} />
          </div>

          <div className="panel">
            <h3>Readiness</h3>
            <div className="kv-row"><span className="kv-label">Owned toward this deck</span><span className="kv-value">{a.have} / {a.totalCards}</span></div>
            <div className="kv-row"><span className="kv-label">Still needed</span><span className="kv-value">{a.need}</span></div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${a.readiness}%`, background: a.readiness === 100 ? "var(--good)" : a.readiness >= 60 ? "var(--warn)" : "var(--bad)" }} />
            </div>
          </div>

          <div className="panel">
            <h3>Budget to complete</h3>
            <div className="kv-row"><span className="kv-label">Priced shortfall</span><span className="kv-value">{fmtMoney(a.buyCost)}</span></div>
            {a.unpriced > 0 && (
              <div className="kv-row"><span className="kv-label">Missing a price for</span><span className="kv-value">{a.unpriced} copies</span></div>
            )}
            <p style={{ marginTop: 8, color: "var(--ink-faint)", fontSize: 11.5 }}>Set prices from the Buy list tab. Manual entry — not linked to any marketplace.</p>
          </div>
        </div>
      </div>
    </PersonShell>
  );
}
