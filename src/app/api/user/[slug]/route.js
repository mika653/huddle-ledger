import { NextResponse } from "next/server";
import { kvGet, kvSet, kvSAdd, kvSRem, kvDel } from "@/lib/store";
import { isValidSlug } from "@/lib/slug";

const EMPTY_STATE = { collection: {}, decks: [], prices: {}, displayName: "" };

export async function GET(request, { params }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const data = await kvGet(`user:${slug}`);
  const secret = await kvGet(`secret:${slug}`);
  return NextResponse.json({ ...(data || { ...EMPTY_STATE, displayName: slug }), hasOwner: !!secret });
}

export async function PUT(request, { params }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const providedSecret = request.headers.get("x-edit-secret");
  const storedSecret = await kvGet(`secret:${slug}`);
  if (storedSecret) {
    if (providedSecret !== storedSecret) {
      return NextResponse.json({ error: "not the owner of this page" }, { status: 403 });
    }
  } else if (providedSecret) {
    // First successful write for this slug claims it.
    await kvSet(`secret:${slug}`, providedSecret);
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

export async function DELETE(request, { params }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const providedSecret = request.headers.get("x-edit-secret");
  const storedSecret = await kvGet(`secret:${slug}`);
  if (storedSecret && providedSecret !== storedSecret) {
    return NextResponse.json({ error: "not the owner of this page" }, { status: 403 });
  }
  await kvDel(`user:${slug}`);
  await kvDel(`secret:${slug}`);
  await kvSRem("directory", slug);
  return NextResponse.json({ ok: true });
}
