"use client";

import { use, useMemo, useState } from "react";
import PersonShell from "@/components/PersonShell";
import { usePersonState } from "@/lib/usePersonState";
import { CARDS, COLOR_HEX, costLabel, searchCards } from "@/lib/cards";

export default function CollectionPage({ params }) {
  const { slug } = use(params);
  const { state, update, loading, saveStatus } = usePersonState(slug);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (query.trim()) return searchCards(query, 200);
    return CARDS.filter((c) => (state.collection[c.id] || 0) > 0);
  }, [query, state.collection]);

  function setOwned(id, n) {
    n = Math.max(0, Math.min(99, n));
    update((prev) => {
      const collection = { ...prev.collection };
      if (n === 0) delete collection[id];
      else collection[id] = n;
      return { ...prev, collection };
    });
  }

  const uniqueOwned = Object.keys(state.collection).length;

  return (
    <PersonShell slug={slug} saveStatus={saveStatus}>
      <div className="page-head">
        <div>
          <h1>Collection</h1>
          <p>Search the full {CARDS.length}-card pool and set how many copies you own. Own more than a playset? Keep going — it&apos;ll show as spare.</p>
        </div>
      </div>
      <div className="search-box">
        <input type="text" placeholder="Search a card name…" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
      </div>
      <div style={{ marginTop: 16 }} className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Card</th>
              <th>Type</th>
              <th className="num">Cost</th>
              <th className="num">Vibe</th>
              <th className="num">Owned</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <h3>Loading…</h3>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <h3>{query ? "No matches" : "Nothing logged yet"}</h3>
                    <p>{query ? "Try a different search term." : "Search above and start setting counts — owned cards will show here."}</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((c) => {
                const n = state.collection[c.id] || 0;
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="card-name-cell">
                        <span className="swatch" style={{ background: COLOR_HEX[c.co] || "var(--c-colorless)" }} />
                        <div>
                          <div className="card-name">{c.n}</div>
                          <div className="card-meta">{c.co} · {c.r}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.t}</td>
                    <td className="num">{costLabel(c.c)}</td>
                    <td className="num">{c.v == null ? "—" : c.v}</td>
                    <td className="num">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        {n > 4 && (
                          <span className="chip chip-good" style={{ marginRight: 8 }} title="More than a playset — available to trade or sell">
                            {n - 4} spare
                          </span>
                        )}
                        <div className="stepper">
                          <button disabled={n <= 0} onClick={() => setOwned(c.id, n - 1)}>−</button>
                          <span className="count">{n}</span>
                          <button disabled={n >= 99} onClick={() => setOwned(c.id, n + 1)}>+</button>
                        </div>
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
    </PersonShell>
  );
}
