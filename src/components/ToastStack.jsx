"use client";

export default function ToastStack({ toasts, dismiss }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          className={"toast toast-" + t.tone}
          onClick={() => dismiss?.(t.id)}
          style={{ pointerEvents: "auto", border: "none", cursor: "pointer" }}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
