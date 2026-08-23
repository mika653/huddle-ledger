"use client";

export default function ToastStack({ toasts }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={"toast toast-" + t.tone}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
