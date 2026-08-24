"use client";

import { useCallback, useRef, useState } from "react";

let nextId = 1;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, tone = "good") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    // Errors stay up longer — they're often the only signal something didn't save.
    const duration = tone === "bad" ? 6000 : 2200;
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, duration);
  }, []);

  return { toasts, showToast, dismiss };
}
