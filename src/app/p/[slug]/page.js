"use client";

import { use, useMemo, useState } from "react";
import PersonShell from "@/components/PersonShell";
import CardThumb from "@/components/CardThumb";
import CardZoomModal from "@/components/CardZoomModal";
import ToastStack from "@/components/ToastStack";
import { usePersonState } from "@/lib/usePersonState";
import { useToasts } from "@/lib/useToasts";
import { useCardZoom } from "@/lib/useCardZoom";
import { CARDS, costLabel, searchCards } from "@/lib/cards";
import { FINISHES, normalizeEntry, totalOwned, spareCount } from "@/lib/finishes";

function FinishStepper({ value, onChange, disabled, label, cardName, finishKey }) {
  return (
    <div className={"stepper stepper-sm finish-" + finishKey}>
      <button aria-label={`Remove one ${label} ${cardName}`} disabled={disabled || value <= 0} onClick={() => onChange(value - 1)}>−</button>
      <span className="count">{value}</span>
      <button aria-label={`Add one ${label} ${cardName}`} disabled={disabled || value >= 99} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

const COLSPAN = 3 + FINISHES.length;

export default function CollectionPage({ params }) {
  const { slug } = use(params);
  const { toasts, showToast, dismiss } = useToasts();
  const { state, update, loading, saveStatus, isOwner } = usePersonState(slug, (ok) => {
    showToast(ok ? "✓ Saved" : "Save failed — check your connection", ok ? "good" : "bad");
  });
  const zoom = useCardZoom();
  const [query, setQuery] = useState("");
  const [view, setView] = useState("table");

  const rows = useMemo(() => {
    if (query.trim()) return searchCards(query, 200);
    return CARDS.filter((c) => totalOwned(state.collection[c.id]) > 0);
  }, [query, state.collection]);

  function setFinish(id, finishKey, n) {
    n = Math.max(0, Math.min(99, n));
    update((prev) => {
      const entry = normalizeEntry(prev.collection[id]);
      entry[finishKey] = n;
      const collection = { ...prev.collection };
      if (totalOwned(entry) === 0) delete collection[id];
      else collection[id] = entry;
      return { ...prev, collection };
    });
  }

  const uniqueOwned = Object.keys(state.collection).length;

  return (
    <PersonShell slug={slug} saveStatus={saveStatus} isOwner={isOwner}>
      <div className="page-head">
        <div>
          <h1>Collection</h1>
          <p>Search the full {CARDS.length}-card pool and log Regular, Foil, and Special Foil counts separately. Own more than a playset of any one finish? It&apos;ll show as spare.</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div className="search-box" style={{ flex: "1 1 240px" }}>
          <label htmlFor="card-search" className="sr-only">Search a card name</label>
          <input id="card-search" type="text" placeholder="Search a card name…" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
        </div>
        <div className="view-toggle" role="group" aria-label="Collection view">
          <button type="button" className={view === "table" ? "active" : ""} aria-pressed={view === "table"} onClick={() => setView("table")}>Table</button>
          <button type="button" className={view === "gallery" ? "active" : ""} aria-pressed={view === "gallery"} onClick={() => setView("gallery")}>Gallery</button>
        </div>
      </div>
      {view === "gallery" ? (
        loading ? (
          <div className="table-wrap" style={{ marginTop: 16 }}><div className="empty-state"><h3>Loading…</h3></div></div>
        ) : rows.length === 0 ? (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <div className="empty-state">
              <h3>{query ? "No matches" : "Nothing logged yet"}</h3>
              <p>{query ? "Try a different search term." : "Search above and start setting counts — owned cards will show here."}</p>
            </div>
          </div>
        ) : (
          <div className="card-gallery">
            {rows.map((c) => {
              const entry = normalizeEntry(state.collection[c.id]);
              const total = totalOwned(entry);
              const spare = spareCount(entry);
              return (
                <button key={c.id} type="button" className="gallery-tile" onClick={() => zoom.open(c)}>
                  <CardThumb card={c} />
                  <div className="card-name">{c.n}</div>
                  <div className="gallery-badges">
                    {total > 0 ? (
                      <span className="gallery-badge">Own {total}</span>
                    ) : (
                      <span className="gallery-badge">Not owned</span>
                    )}
                    {spare > 0 && <span className="gallery-badge spare">{spare} spare</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )
      ) : (
      <div style={{ marginTop: 16 }} className="table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Card</th>
              <th className="num">Cost</th>
              {FINISHES.map((f) => (
                <th className="num" key={f.key} title={f.label}>{f.short}</th>
              ))}
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLSPAN}>
                  <div className="empty-state">
                    <h3>Loading…</h3>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLSPAN}>
                  <div className="empty-state">
                    <h3>{query ? "No matches" : "Nothing logged yet"}</h3>
                    <p>{query ? "Try a different search term." : "Search above and start setting counts — owned cards will show here."}</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((c) => {
                const entry = normalizeEntry(state.collection[c.id]);
                const total = totalOwned(entry);
                const spare = spareCount(entry);
                return (
                  <tr key={c.id}>
                    <td className="row-title">
                      <div className="card-name-cell">
                        <button type="button" className="thumb-btn" aria-label={`Zoom ${c.n}`} onClick={() => zoom.open(c)}>
                          <CardThumb card={c} />
                        </button>
                        <div>
                          <div className="card-name">{c.n}</div>
                          <div className="card-meta">{c.co} · {c.r}</div>
                        </div>
                      </div>
                    </td>
                    <td className="num row-stat" data-label="Cost" aria-label={`Cost: ${costLabel(c.c)}`}>{costLabel(c.c)}</td>
                    {FINISHES.map((f) => (
                      <td className="num row-stat" data-label={f.label} key={f.key}>
                        <FinishStepper
                          value={entry[f.key]}
                          onChange={(n) => setFinish(c.id, f.key, n)}
                          disabled={!isOwner}
                          label={f.label}
                          cardName={c.n}
                          finishKey={f.key}
                        />
                      </td>
                    ))}
                    <td className="num row-stat" data-label="Total" aria-label={`Total owned: ${total}${spare > 0 ? `, ${spare} spare` : ""}`}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        {spare > 0 && (
                          <span className="chip chip-good" title="More than a playset of at least one finish — available to trade or sell">
                            {spare} spare
                          </span>
                        )}
                        <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{total}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}
      <p style={{ marginTop: 10, color: "var(--ink-faint)", fontSize: 12 }}>{uniqueOwned} unique cards logged so far.</p>
      <CardZoomModal card={zoom.card} onClose={zoom.close} />
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </PersonShell>
  );
}
