import { NextResponse } from "next/server";
import { kvGet, kvSMembers } from "@/lib/store";
import { spareCount } from "@/lib/finishes";

export async function GET() {
  const slugs = await kvSMembers("directory");
  const people = await Promise.all(
    slugs.map(async (slug) => {
      const data = await kvGet(`user:${slug}`);
      const collectionCount = data ? Object.keys(data.collection || {}).length : 0;
      const deckCount = data ? (data.decks || []).length : 0;
      const spareCards = {};
      if (data) {
        for (const [cardId, entry] of Object.entries(data.collection || {})) {
          const n = spareCount(entry);
          if (n > 0) spareCards[cardId] = n;
        }
      }
      const surplusCount = Object.values(spareCards).reduce((a, b) => a + b, 0);
      return {
        slug,
        displayName: (data && data.displayName) || slug,
        collectionCount,
        deckCount,
        surplusCount,
        spareCards,
      };
    })
  );
  return NextResponse.json({ people });
}
