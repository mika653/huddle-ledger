"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function isMe(slug) {
  if (typeof window === "undefined") return true;
  const remembered = localStorage.getItem("huddle-ledger:me");
  if (!remembered) return true;
  return remembered.trim().toLowerCase().replace(/\s+/g, "-") === slug;
}

export default function PersonShell({ slug, saveStatus, children }) {
  const pathname = usePathname();
  const [viewingSomeoneElse, setViewingSomeoneElse] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setViewingSomeoneElse(!isMe(slug));
  }, [slug]);

  // Close the mobile menu whenever the route actually changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: `/p/${slug}`, label: "Collection", sw: "var(--c-blue)", exact: true },
    { href: `/p/${slug}/decks`, label: "Decks", sw: "var(--c-green)" },
    { href: `/p/${slug}/shopping`, label: "Shopping list", sw: "var(--accent)" },
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
        </nav>
        <div className="rail-foot">
          <a href="/" style={{ color: "var(--rail-ink-dim)", textDecoration: "underline" }}>
            ← switch person
          </a>
          {!viewingSomeoneElse && (
            <div className="save-chip">
              <span className={"save-dot " + (saveStatus || "saved")} />
              <span>
                {saveStatus === "saving" ? "Saving…" : saveStatus === "pending" ? "Unsaved changes" : saveStatus === "error" ? "Save failed" : "Saved"}
              </span>
            </div>
          )}
        </div>
      </div>
      <main id="main">
        {viewingSomeoneElse && (
          <div className="view-banner">
            <span>👀 You&apos;re viewing <b>{slug}</b>&apos;s collection — ask them if something&apos;s up for trade.</span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
