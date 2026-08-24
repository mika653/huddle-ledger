// A per-slug "edit secret" this browser holds, so PUT/DELETE can be
// enforced server-side instead of trusting a client-only name comparison.
// Not real auth (no passwords) — just enough to stop a stray click on a
// friend's link from silently overwriting their data. First browser to
// successfully save under a slug claims it (see api/user/[slug]/route.js).

function key(slug) {
  return `huddle-ledger:secret:${slug}`;
}

export function getLocalSecret(slug) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key(slug));
}

export function getOrCreateLocalSecret(slug) {
  if (typeof window === "undefined") return null;
  let secret = localStorage.getItem(key(slug));
  if (!secret) {
    secret = crypto.randomUUID();
    localStorage.setItem(key(slug), secret);
  }
  return secret;
}
