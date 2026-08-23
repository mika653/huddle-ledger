import { NextResponse } from "next/server";
import { kvGet, kvSet, kvSAdd } from "@/lib/store";
import { isValidSlug } from "@/lib/slug";

const EMPTY_STATE = { collection: {}, decks: [], prices: {}, displayName: "" };

export async function GET(request, { params }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const data = await kvGet(`user:${slug}`);
  return NextResponse.json(data || { ...EMPTY_STATE, displayName: slug });
}

export async function PUT(request, { params }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const body = await request.json();
  const state = {
    collection: body.collection || {},
    decks: body.decks || [],
    prices: body.prices || {},
    displayName: body.displayName || slug,
  };
  await kvSet(`user:${slug}`, state);
  await kvSAdd("directory", slug);
  return NextResponse.json({ ok: true });
}
