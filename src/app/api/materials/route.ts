// src/app/api/materials/route.ts
import { NextRequest } from "next/server";
import { ApiError, serverFetch } from "@/lib/serverFetch";

export async function GET(req: NextRequest) {
  const url = "/materials" + (req.nextUrl.search ? req.nextUrl.search : "");
  try {
    const res = await serverFetch(url, { method: "GET" });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof ApiError) {
      return Response.json({ message: e.message }, { status: e.status });
    }
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const res = await serverFetch("/materials", { method: "POST", body: form });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof ApiError) {
      return Response.json({ message: e.message }, { status: e.status });
    }
    throw e;
  }
}
