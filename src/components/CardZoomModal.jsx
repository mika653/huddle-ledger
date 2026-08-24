"use client";

import { useEffect, useState } from "react";
import { artSrc, COLOR_HEX, costLabel } from "@/lib/cards";

export default function CardZoomModal({ card, onClose }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [card]);

  useEffect(() => {
    if (!card) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div className="modal-backdrop card-zoom-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card-zoom-modal" role="dialog" aria-modal="true" aria-label={card.n}>
        <button className="card-zoom-close" aria-label="Close" onClick={onClose}>×</button>
        {failed ? (
          <div className="card-zoom-fallback" style={{ background: COLOR_HEX[card.co] || "var(--c-colorless)" }} />
        ) : (
          <img className="card-zoom-img" src={artSrc(card)} alt={card.n} onError={() => setFailed(true)} />
        )}
        <div className="card-zoom-meta">
          <h3>{card.n}</h3>
          <p className="card-zoom-tags">
            <span className="chip chip-neutral">{card.co}</span>
            <span className="chip chip-neutral">{card.t}</span>
            <span className="chip chip-neutral">{card.r}</span>
            {card.c ? <span className="chip chip-neutral">{costLabel(card.c)}</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
}
