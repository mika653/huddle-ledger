"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY = { collection: {}, decks: [], prices: {}, displayName: "" };

// onSaveResult(ok: boolean) fires once a debounced save actually completes —
// this is the real "did it save" signal, not just "did you click something".
export function usePersonState(slug, onSaveResult) {
  const [state, setState] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | pending | saving | error
  const saveTimer = useRef(null);
  const latest = useRef(state);
  latest.current = state;
  const onSaveResultRef = useRef(onSaveResult);
  onSaveResultRef.current = onSaveResult;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/user/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setState({ ...EMPTY, ...data });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const doSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/user/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(latest.current),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveStatus("saved");
      onSaveResultRef.current?.(true);
    } catch {
      setSaveStatus("error");
      onSaveResultRef.current?.(false);
    }
  }, [slug]);

  const scheduleSave = useCallback(() => {
    setSaveStatus("pending");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 900);
  }, [doSave]);

  const update = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next;
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  return { state, update, loading, saveStatus };
}
