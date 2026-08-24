"use client";

import { use, useMemo } from "react";
import PersonShell from "@/components/PersonShell";
import CardThumb from "@/components/CardThumb";
import CardZoomModal from "@/components/CardZoomModal";
import ToastStack from "@/components/ToastStack";
import { usePersonState } from "@/lib/usePersonState";
import { useToasts } from "@/lib/useToasts";
import { useCardZoom } from "@/lib/useCardZoom";
import { shoppingListAcrossDecks, fmtMoney } from "@/lib/deckAnalysis";

export default function ShoppingPage({ params }) {
  const { slug } = use(params);
  const { toasts, showToast, dismiss } = useToasts();
  const { state, update, saveStatus, isOwner } = usePersonState(slug, (ok) => {
    showToast(ok ? "✓ Saved" : "Save failed — check your connection", ok ? "good" : "bad");
  });
  const zoom = useCardZoom();

  const { agg, total } = useMemo(
    () => shoppingListAcrossDecks(state.decks, state.collection, state.prices),
    [state.decks, state.collection, state.prices]
  );
  const ids = Object.keys(agg).sort((x, y) => agg[y].need - agg[x].need);

  function setPrice(id, value) {
    const v = Math.max(0, Math.round(Number(value) || 0));
    update((prev) => {
      const prices = { ...prev.prices };
      if (v === 0) delete prices[id];
      else prices[id] = v;
      return { ...prev, prices };
    });
  }

  return (
    <PersonShell slug={slug} saveStatus={saveStatus} isOwner={isOwner}>
      <div className="page-head">
        <div>
          <h1>Shopping list</h1>
          <p>Every card missing from any tracked deck, deduplicated to the highest count needed by a single list.</p>
        </div>
      </div>

      {ids.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <h3>Shopping list is empty</h3>
            <p>Once a saved deck is short on cards, they&apos;ll be aggregated here — deduplicated across every deck you track.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="responsive-table">
              <thead><tr><th>Card</th><th className="num">Need</th><th className="num">Price ea.</th><th className="num">Subtotal</th></tr></thead>
              <tbody>
                {ids.map((id) => {
                  const e = agg[id];
                  const pr = state.prices[id] || 0;
                  return (
                    <tr key={id}>
                      <td className="row-title">
                        <div className="card-name-cell">
                          <button type="button" className="thumb-btn" aria-label={`Zoom ${e.card.n}`} onClick={() => zoom.open(e.card)}>
                            <CardThumb card={e.card} />
                          </button>
                          <div>
                            <div className="card-name">{e.card.n}</div>
                            <div className="card-meta">needed for {e.decks.join(", ")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="num row-stat" data-label="Need" aria-label={`Need: ${e.need}`} style={{ fontWeight: 700 }}>{e.need}</td>
                      <td className="num row-stat" data-label="Price ea.">
                        <input className="price-input" type="number" min="0" step="1" defaultValue={pr || ""} placeholder="0"
                          aria-label={`Price each for ${e.card.n}`}
                          disabled={!isOwner}
                          onBlur={(ev) => setPrice(id, ev.target.value)} />
                      </td>
                      <td className="num row-stat" data-label="Subtotal" aria-label={`Subtotal: ${pr ? fmtMoney(pr * e.need) : "none"}`}>{pr ? fmtMoney(pr * e.need) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="panel" style={{ marginTop: 16, maxWidth: 340 }}>
            <h3>Total to buy</h3>
            <div className="kv-row">
              <span className="kv-label">Across {state.decks.length} deck{state.decks.length === 1 ? "" : "s"}</span>
              <span className="kv-value" style={{ fontSize: 18 }}>{fmtMoney(total)}</span>
            </div>
          </div>
        </>
      )}
      <CardZoomModal card={zoom.card} onClose={zoom.close} />
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </PersonShell>
  );
}
