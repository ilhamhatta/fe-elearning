// src/app/api/submissions/[id]/grade/route.ts
import { NextResponse } from "next/server";
import { ApiError, serverFetch } from "@/lib/serverFetch";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  try {
    const res = await serverFetch(`/submissions/${params.id}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
