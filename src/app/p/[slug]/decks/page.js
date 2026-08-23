"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import PersonShell from "@/components/PersonShell";
import { usePersonState } from "@/lib/usePersonState";
import { deckAnalysis, fmtMoney } from "@/lib/deckAnalysis";

function uid() {
  return "d" + Math.random().toString(36).slice(2, 10);
}

export default function DecksPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const { state, update, saveStatus } = usePersonState(slug);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");

  function createDeck() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const deck = { id: uid(), name: trimmed, cards: {} };
    update((prev) => ({ ...prev, decks: [...prev.decks, deck] }));
    setShowNew(false);
    setName("");
    router.push(`/p/${slug}/decks/${deck.id}`);
  }

  return (
    <PersonShell slug={slug} saveStatus={saveStatus}>
      <div className="page-head">
        <div>
          <h1>Decks</h1>
          <p>Track every list you&apos;re testing and see at a glance how close each is to buildable.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowNew(true)}>+ New deck</button>
      </div>

      {state.decks.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <h3>No decks yet</h3>
            <p>Create your first decklist to start tracking readiness.</p>
          </div>
        </div>
      ) : (
        <div className="deck-list">
          {state.decks.map((deck) => {
            const a = deckAnalysis(deck, state.collection, state.prices);
            const chipClass = a.readiness === 100 ? "chip-good" : a.readiness >= 60 ? "chip-warn" : "chip-bad";
            const barColor = a.readiness === 100 ? "var(--good)" : a.readiness >= 60 ? "var(--warn)" : "var(--bad)";
            return (
              <a key={deck.id} className="deck-card" href={`/p/${slug}/decks/${deck.id}`}>
                <div className="deck-card-head">
                  <span className="deck-card-name">{deck.name}</span>
                  <span className={"chip " + chipClass}>{a.readiness}%</span>
                </div>
                <div style={{ marginTop: 6, color: "var(--ink-soft)", fontSize: 12.5 }}>
                  {a.totalCards}/52 cards · {a.needCards.length} short
                  {a.needCards.length ? ` · ${fmtMoney(a.buyCost)} to buy` : ""}
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${a.readiness}%`, background: barColor }} />
                </div>
              </a>
            );
          })}
        </div>
      )}

      {showNew && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowNew(false)}>
          <div className="modal">
            <h3>New deck</h3>
            <input
              type="text"
              placeholder="e.g. Yum Yum Sphinx"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createDeck()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={createDeck}>Create</button>
            </div>
          </div>
        </div>
      )}
    </PersonShell>
  );
}
