"use client";

import { use, useEffect, useMemo, useState } from "react";
import PersonShell from "@/components/PersonShell";
import CardThumb from "@/components/CardThumb";
import { usePersonState } from "@/lib/usePersonState";
import { shoppingListAcrossDecks } from "@/lib/deckAnalysis";
import { CARDS_BY_ID } from "@/lib/cards";

export default function TradesPage({ params }) {
  const { slug } = use(params);
  const { state, loading, saveStatus, isOwner } = usePersonState(slug);
  const [people, setPeople] = useState(null);

  useEffect(() => {
    fetch("/api/directory")
      .then((r) => r.json())
      .then((d) => setPeople(d.people || []))
      .catch(() => setPeople([]));
  }, []);

  const { agg } = useMemo(
    () => shoppingListAcrossDecks(state.decks, state.collection, state.prices),
    [state.decks, state.collection, state.prices]
  );
  const neededIds = Object.keys(agg);

  const matches = useMemo(() => {
    if (!people) return [];
    return neededIds
      .map((id) => {
        const holders = people
          .filter((p) => p.slug !== slug && p.spareCards && p.spareCards[id] > 0)
          .map((p) => ({ displayName: p.displayName, slug: p.slug, spare: p.spareCards[id] }));
        return { id, card: CARDS_BY_ID[id], need: agg[id].need, holders };
      })
      .filter((row) => row.holders.length > 0);
  }, [people, neededIds, agg, slug]);

  const ready = !loading && people !== null;

  return (
    <PersonShell slug={slug} saveStatus={saveStatus} isOwner={isOwner}>
      <div className="page-head">
        <div>
          <h1>Who has my needs?</h1>
          <p>Cards on your shopping list that someone in the huddle already has spare — go ask them before you buy.</p>
        </div>
      </div>

      {!ready ? (
        <div className="table-wrap">
          <div className="empty-state"><h3>Loading…</h3></div>
        </div>
      ) : neededIds.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <h3>Nothing on your shopping list</h3>
            <p>Once a saved deck is short on cards, matches from the rest of the huddle will show here.</p>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <h3>No matches yet</h3>
            <p>Nobody in the huddle has a spare copy of anything you need right now.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="responsive-table">
            <thead><tr><th>Card</th><th className="num">You need</th><th>Has spare</th></tr></thead>
            <tbody>
              {matches.map((row) => (
                <tr key={row.id}>
                  <td className="row-title">
                    <div className="card-name-cell">
                      <CardThumb card={row.card} />
                      <div className="card-name">{row.card.n}</div>
                    </div>
                  </td>
                  <td className="num row-stat" data-label="You need" aria-label={`You need: ${row.need}`}>{row.need}</td>
                  <td className="row-stat no-label" data-label="Has spare">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
                      {row.holders.map((h) => (
                        <a key={h.slug} className="chip chip-good" href={`/p/${h.slug}`} title={`${h.displayName}'s collection`}>
                          {h.displayName} ({h.spare})
                        </a>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PersonShell>
  );
}
