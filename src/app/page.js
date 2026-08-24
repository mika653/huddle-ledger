"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toSlug } from "@/lib/slug";

export default function Landing() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [people, setPeople] = useState(null);

  useEffect(() => {
    const remembered = localStorage.getItem("huddle-ledger:me");
    if (remembered) setName(remembered);
    fetch("/api/directory")
      .then((r) => r.json())
      .then((d) => setPeople(d.people || []))
      .catch(() => setPeople([]));
  }, []);

  function go() {
    const slug = toSlug(name);
    if (!slug) return;
    const existing = (people || []).find((p) => p.slug === slug);
    if (existing && existing.displayName.trim().toLowerCase() !== name.trim().toLowerCase()) {
      const proceed = confirm(
        `"${existing.displayName}" is already using this page. If that's not you, pick a slightly different name so you don't end up viewing their collection instead of starting your own.\n\nContinue to ${existing.displayName}'s page anyway?`
      );
      if (!proceed) return;
    }
    localStorage.setItem("huddle-ledger:me", name.trim());
    router.push(`/p/${slug}`);
  }

  return (
    <div className="landing">
      <div className="landing-card">
        <div className="landing-emoji">🐧</div>
        <h1>Huddle Ledger</h1>
        <p>Track your Vibes TCG collection, build decks, and see what your friends have spare.</p>
        <label htmlFor="landing-name" className="sr-only">What&apos;s your name?</label>
        <input
          id="landing-name"
          type="text"
          placeholder="What's your name?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          autoFocus
        />
        <button className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }} onClick={go}>
          {people && people.length ? "Open my ledger" : "Get started"}
        </button>

        {people && people.length > 0 && (
          <div className="directory-list">
            <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
              Already tracking
            </h3>
            {people.map((p) => (
              <a key={p.slug} className="directory-item" href={`/p/${p.slug}`}>
                <span>{p.displayName}</span>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="chip chip-neutral">{p.collectionCount} cards</span>
                  {p.surplusCount > 0 && <span className="chip chip-good">{p.surplusCount} spare</span>}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
