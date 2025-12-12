// src/app/api/discussions/[id]/replies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const search = new URL(req.url).search; // ?page=&per_page=
  try {
    const r = await serverFetch(`/discussions/${id}/replies${search}`, {
      method: "GET",
    });
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
  } catch (e) {
    if (e instanceof ApiError)
      return NextResponse.json({ message: e.message }, { status: e.status });
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  try {
    const r = await serverFetch(`/discussions/${id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
  } catch (e) {
    if (e instanceof ApiError)
      return NextResponse.json({ message: e.message }, { status: e.status });
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
