"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PersonShell({ slug, saveStatus, isOwner = true, children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route actually changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: `/p/${slug}`, label: "Collection", sw: "var(--c-blue)", exact: true },
    { href: `/p/${slug}/decks`, label: "Decks", sw: "var(--c-green)" },
    { href: `/p/${slug}/shopping`, label: "Shopping list", sw: "var(--accent)" },
    { href: `/p/${slug}/trades`, label: "Who has my needs?", sw: "var(--c-yellow)" },
  ];

  const activeLink = links.find((l) => (l.exact ? pathname === l.href : pathname.startsWith(l.href)));

  return (
    <div id="shell">
      <div id="rail">
        <div className="rail-top-row">
          <a className="brand" href="/">
            <span className="brand-mark">🐧</span>
            <span className="brand-name">Huddle Ledger</span>
          </a>
          <button
            className="burger-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {isOwner ? (
              <span className={"save-dot " + (saveStatus || "saved")} title={saveStatus === "error" ? "Save failed" : saveStatus} />
            ) : (
              <span className="save-dot" style={{ background: "var(--warn)" }} title="Read-only" />
            )}
            <span className="burger-current">{activeLink?.label || "Menu"}</span>
            <span className={"burger-icon" + (menuOpen ? " open" : "")}>
              <span /><span /><span />
            </span>
          </button>
        </div>
        <div className="brand-sub">{slug}&apos;s collection</div>
        <nav className={"rail-nav" + (menuOpen ? " menu-open" : "")}>
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <a key={l.href} className={"rail-link" + (active ? " active" : "")} href={l.href}>
                <span className="rail-swatch" style={{ background: l.sw }} />
                {l.label}
              </a>
            );
          })}
          <a className="rail-link mobile-only-link" href="/">
            <span className="rail-swatch" style={{ background: "var(--rail-ink-dim)" }} />
            ← Switch person
          </a>
          <button
            type="button"
            className="rail-link rail-export-link"
            onClick={async () => {
              const res = await fetch(`/api/user/${slug}`);
              const data = await res.json();
              delete data.hasOwner;
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `huddle-ledger-${slug}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <span className="rail-swatch" style={{ background: "var(--rail-ink-dim)" }} />
            ⬇ Download my data
          </button>
        </nav>
        {menuOpen && <button className="rail-nav-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
        <div className="rail-foot">
          <a href="/" style={{ color: "var(--rail-ink-dim)", textDecoration: "underline" }}>
            ← switch person
          </a>
          {isOwner ? (
            <div className="save-chip">
              <span className={"save-dot " + (saveStatus || "saved")} />
              <span>
                {saveStatus === "saving" ? "Saving…" : saveStatus === "pending" ? "Unsaved changes" : saveStatus === "error" ? "Save failed" : "Saved"}
              </span>
            </div>
          ) : (
            <div className="save-chip">
              <span className="save-dot" style={{ background: "var(--warn)" }} />
              <span>Read-only</span>
            </div>
          )}
        </div>
      </div>
      <main id="main">
        {!isOwner && (
          <div className="view-banner">
            <span>👀 You&apos;re viewing <b>{slug}</b>&apos;s collection, read-only — ask them if something&apos;s up for trade. Go to the landing page and enter your own name to start your own ledger.</span>
          </div>
        )}
        <div className={isOwner ? "" : "read-only-zone"} aria-disabled={!isOwner}>
          {children}
        </div>
      </main>
    </div>
  );
}
