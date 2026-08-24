"use client";

import { useCallback, useState } from "react";

export function useCardZoom() {
  const [card, setCard] = useState(null);
  const open = useCallback((c) => setCard(c), []);
  const close = useCallback(() => setCard(null), []);
  return { card, open, close };
}
