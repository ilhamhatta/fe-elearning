// src/app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const api = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await api.json().catch(() => ({}));
  if (!api.ok) {
    return NextResponse.json(
      { message: data?.message || "Login gagal" },
      { status: api.status }
    );
  }

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });

  res.cookies.set("auth_token", data.token, {
    httpOnly: true,
    secure: isProd, // di dev = false
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return res;
}
