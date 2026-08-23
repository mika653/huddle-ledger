export function toSlug(name) {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export function isValidSlug(slug) {
  return /^[a-z0-9-]{1,40}$/.test(slug || "");
}
