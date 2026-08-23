import { NextResponse } from "next/server";
import { kvGet, kvSMembers } from "@/lib/store";

export async function GET() {
  const slugs = await kvSMembers("directory");
  const people = await Promise.all(
    slugs.map(async (slug) => {
      const data = await kvGet(`user:${slug}`);
      const collectionCount = data ? Object.keys(data.collection || {}).length : 0;
      const deckCount = data ? (data.decks || []).length : 0;
      const surplusCount = data
        ? Object.values(data.collection || {}).filter((n) => n > 4).length
        : 0;
      return {
        slug,
        displayName: (data && data.displayName) || slug,
        collectionCount,
        deckCount,
        surplusCount,
      };
    })
  );
  return NextResponse.json({ people });
}
