// src/app/api/submissions/route.ts
import { NextResponse } from "next/server";
import { ApiError, serverFetch } from "@/lib/serverFetch";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    // Forward multipart apa adanya (jangan set Content-Type manual)
    const res = await serverFetch("/submissions", {
      method: "POST",
      body: form as unknown as BodyInit, // FormData kompatibel
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
