"use client";

import { use, useMemo, useState } from "react";
import PersonShell from "@/components/PersonShell";
import CardThumb from "@/components/CardThumb";
import ToastStack from "@/components/ToastStack";
import { usePersonState } from "@/lib/usePersonState";
import { useToasts } from "@/lib/useToasts";
import { CARDS, costLabel, searchCards } from "@/lib/cards";
import { FINISHES, normalizeEntry, totalOwned } from "@/lib/finishes";

function FinishStepper({ value, onChange }) {
  return (
    <div className="stepper stepper-sm">
      <button disabled={value <= 0} onClick={() => onChange(value - 1)}>−</button>
      <span className="count">{value}</span>
      <button disabled={value >= 99} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export default function CollectionPage({ params }) {
  const { slug } = use(params);
  const { toasts, showToast } = useToasts();
  const { state, update, loading, saveStatus } = usePersonState(slug, (ok) => {
    showToast(ok ? "✓ Saved" : "Save failed — check your connection", ok ? "good" : "bad");
  });
  const [query, setQuery] = useState("");

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
    <PersonShell slug={slug} saveStatus={saveStatus}>
      <div className="page-head">
        <div>
          <h1>Collection</h1>
          <p>Search the full {CARDS.length}-card pool and log Regular, Foil, and Special Foil counts separately. Own more than a playset in total? It&apos;ll show as spare.</p>
        </div>
      </div>
      <div className="search-box">
        <input type="text" placeholder="Search a card name…" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
      </div>
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
                <td colSpan={6}>
                  <div className="empty-state">
                    <h3>Loading…</h3>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6}>
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
                return (
                  <tr key={c.id}>
                    <td className="row-title">
                      <div className="card-name-cell">
                        <CardThumb card={c} />
                        <div>
                          <div className="card-name">{c.n}</div>
                          <div className="card-meta">{c.co} · {c.r}</div>
                        </div>
                      </div>
                    </td>
                    <td className="num row-stat" data-label="Cost">{costLabel(c.c)}</td>
                    {FINISHES.map((f) => (
                      <td className="num row-stat" data-label={f.label} key={f.key}>
                        <FinishStepper value={entry[f.key]} onChange={(n) => setFinish(c.id, f.key, n)} />
                      </td>
                    ))}
                    <td className="num row-stat" data-label="Total">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        {total > 4 && (
                          <span className="chip chip-good" title="More than a playset, across all finishes — available to trade or sell">
                            {total - 4} spare
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
      <p style={{ marginTop: 10, color: "var(--ink-faint)", fontSize: 12 }}>{uniqueOwned} unique cards logged so far.</p>
      <ToastStack toasts={toasts} />
    </PersonShell>
  );
}
