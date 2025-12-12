// src/app/api/courses/[id]/enroll/route.ts
// Proxy POST/DELETE ke Laravel: /courses/{id}/enroll
import { NextResponse } from "next/server";
import { ApiError, serverFetch } from "@/lib/serverFetch";

async function proxy(method: "POST" | "DELETE", id: string) {
  try {
    const res = await serverFetch(`/courses/${id}/enroll`, { method });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    throw e;
  }
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  return proxy("POST", params.id);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  return proxy("DELETE", params.id);
}
