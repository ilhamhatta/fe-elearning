// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL!;
const isProd = process.env.NODE_ENV === "production";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function pickStr(o: Record<string, unknown>, k: string): string | null {
  const v = o[k];
  return typeof v === "string" ? v : null;
}
function pickToken(j: unknown): string | null {
  if (!isRecord(j)) return null;
  const direct = pickStr(j, "token") ?? pickStr(j, "access_token");
  if (direct) return direct;

  const data = j["data"];
  if (isRecord(data)) {
    return pickStr(data, "token") ?? pickStr(data, "access_token");
  }
  return null;
}
function pickMessage(j: unknown, fallback: string) {
  if (isRecord(j)) {
    const msg = j["message"];
    if (typeof msg === "string") return msg;

    const errs = j["errors"];
    if (isRecord(errs)) {
      const firstKey = Object.keys(errs)[0];
      const firstVal = errs[firstKey as keyof typeof errs];
      const arr = Array.isArray(firstVal) ? firstVal : null;
      if (arr && typeof arr[0] === "string") return arr[0];
    }
  }
  return fallback;
}

export async function POST(req: NextRequest) {
  if (!API) {
    return NextResponse.json(
      { ok: false, message: "NEXT_PUBLIC_API_URL belum diset." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Payload tidak valid." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const j: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = pickMessage(j, res.statusText || "Registrasi gagal");
      return NextResponse.json(
        { ok: false, message: msg },
        { status: res.status }
      );
    }

    const token = pickToken(j);
    const resp = NextResponse.json({ ok: true });
    if (token) {
      resp.cookies.set("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return resp;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Tidak dapat menghubungi server API." },
      { status: 503 }
    );
  }
}
