// src/app/api/assignments/route.ts
import { NextResponse } from "next/server";
import { ApiError, serverFetch } from "@/lib/serverFetch";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await serverFetch("/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
