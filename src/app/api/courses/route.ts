// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

/**
 * Create Course
 * - fetch (X-Requested-With: fetch) → JSON
 * - submit non-JS → redirect
 */
export async function POST(req: NextRequest) {
  const isFetch = req.headers.get("x-requested-with") === "fetch";
  const form = await req.formData();
  const payload = {
    name: String(form.get("name") ?? ""),
    description: form.get("description")
      ? String(form.get("description"))
      : undefined,
  };

  try {
    await serverFetch("/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return isFetch
      ? NextResponse.json({ ok: true })
      : NextResponse.redirect(new URL("/courses", req.url));
  } catch (e) {
    if (e instanceof ApiError) {
      if (!isFetch && e.status === 401) {
        return NextResponse.redirect(
          new URL("/login?next=/courses/new", req.url)
        );
      }
      return NextResponse.json(
        { message: e.message, status: e.status },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat mata kuliah." },
      { status: 500 }
    );
  }
}
