// src/app/api/discussions/route.ts
import { NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

// Proxy ke Laravel: POST /discussions
export async function POST(req: Request) {
  const form = await req.formData();

  try {
    const res = await serverFetch("/discussions", {
      method: "POST",
      body: form,
    });

    // Teruskan payload apa adanya agar client bisa membaca data.id
    const data = (await res.json()) as unknown;
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { message: "Gagal membuat diskusi" },
      { status: 500 }
    );
  }
}
