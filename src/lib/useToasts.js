"use client";

import { useCallback, useRef, useState } from "react";

let nextId = 1;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const showToast = useCallback((message, tone = "good") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, 2200);
  }, []);

  return { toasts, showToast };
}
