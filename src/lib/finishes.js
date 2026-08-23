// A collection entry is { regular: n, foil: n, specialFoil: n }.
// Older saved data stored a bare number (total regular copies) — normalize
// on read so nothing breaks for people who saved before finishes existed.

export const FINISHES = [
  { key: "regular", label: "Regular", short: "R" },
  { key: "foil", label: "Foil", short: "F" },
  { key: "specialFoil", label: "Special Foil", short: "SF" },
];

export function normalizeEntry(entry) {
  if (typeof entry === "number") return { regular: entry, foil: 0, specialFoil: 0 };
  if (!entry) return { regular: 0, foil: 0, specialFoil: 0 };
  return { regular: entry.regular || 0, foil: entry.foil || 0, specialFoil: entry.specialFoil || 0 };
}

export function totalOwned(entry) {
  const e = normalizeEntry(entry);
  return e.regular + e.foil + e.specialFoil;
}
