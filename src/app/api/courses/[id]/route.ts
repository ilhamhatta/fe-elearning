// src/app/api/courses/[id]/route.ts
import { NextResponse } from "next/server";
import { ApiError, serverJson } from "@/lib/serverFetch";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      name: string;
      description?: string | null;
    };
    const data = await serverJson(`/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = await serverJson(`/courses/${id}`, { method: "DELETE" });
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
