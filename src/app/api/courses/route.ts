// src/app/api/courses/route.ts
import { NextResponse } from "next/server";
import { ApiError, serverJson } from "@/lib/serverFetch";

/**
 * Catatan: Di route handlers, kita TIDAK pakai apiJson/apiCall (yang auto-redirect),
 * agar tidak mengarahkan browser saat fetch() client gagal. Kita kembalikan JSON+status.
 */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      description?: string | null;
    };
    const data = await serverJson("/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
