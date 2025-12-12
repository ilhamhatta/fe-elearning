// src/app/api/broadcasting/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

function backendRoot() {
  const base = process.env.NEXT_PUBLIC_API_URL; // biasanya http://localhost:8000/api
  if (!base) throw new Error("NEXT_PUBLIC_API_URL belum diset");
  return base.replace(/\/api\/?$/i, ""); // jadi http://localhost:8000
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  try {
    const url = `${backendRoot()}/broadcasting/auth`; // ✅ yang benar
    const resp = await serverFetch(url, {
      method: "POST",
      headers: {
        "Content-Type":
          req.headers.get("content-type") ??
          "application/x-www-form-urlencoded",
      },
      body,
    });

    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { message: "Broadcast auth failed" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
