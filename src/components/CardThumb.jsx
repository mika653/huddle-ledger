"use client";

import { useState } from "react";
import { artSrc, COLOR_HEX } from "@/lib/cards";

export default function CardThumb({ card }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="swatch" style={{ background: COLOR_HEX[card.co] || "var(--c-colorless)" }} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="thumb"
      src={artSrc(card)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
