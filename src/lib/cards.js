import cardsData from "@/data/cards.json";

// Lean fields: id, n(ame), co(lor), t(ype), r(arity), v(ibe), c(ost), p(udge)
export const CARDS = cardsData;

export const CARDS_BY_ID = CARDS.reduce((map, c) => {
  map[c.id] = c;
  return map;
}, {});

export const COLOR_HEX = {
  Yellow: "var(--c-yellow)",
  Blue: "var(--c-blue)",
  Green: "var(--c-green)",
  Red: "var(--c-red)",
  Purple: "var(--c-purple)",
  Colorless: "var(--c-colorless)",
};

export function costLabel(c) {
  if (!c) return "—";
  if (c.color === "Fish") return `${c.amount}F`;
  return `${c.amount}${c.color.slice(0, 1)}`;
}

export function searchCards(query, limit = 200) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  return CARDS.filter((c) => c.n.toLowerCase().includes(q)).slice(0, limit);
}
