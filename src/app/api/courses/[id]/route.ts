// src/app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

/**
 * POST (method spoof: _method=PUT|DELETE)
 * - Jika dipanggil via fetch (X-Requested-With: fetch) → return JSON
 * - Jika submit non-JS → redirect
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ⬅️ params adalah Promise
) {
  const { id } = await ctx.params; // ⬅️ WAJIB di-await
  const isFetch = req.headers.get("x-requested-with") === "fetch";
  const form = await req.formData();
  const method = String(form.get("_method") || "").toUpperCase();

  try {
    if (method === "PUT") {
      const payload = {
        name: String(form.get("name") ?? ""),
        description: form.get("description")
          ? String(form.get("description"))
          : undefined,
      };
      await serverFetch(`/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return isFetch
        ? NextResponse.json({ ok: true })
        : NextResponse.redirect(new URL("/courses", req.url));
    }

    if (method === "DELETE") {
      await serverFetch(`/courses/${id}`, { method: "DELETE" });
      return isFetch
        ? NextResponse.json({ ok: true })
        : NextResponse.redirect(new URL("/courses", req.url));
    }

    return NextResponse.json(
      { message: "Metode tidak didukung." },
      { status: 400 }
    );
  } catch (e) {
    if (e instanceof ApiError) {
      if (!isFetch && e.status === 401) {
        return NextResponse.redirect(
          new URL(`/login?next=/courses/${id}/edit`, req.url)
        );
      }
      return NextResponse.json(
        { message: e.message, status: e.status },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}
