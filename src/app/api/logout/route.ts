// src/app/api/logout/route.ts
import { NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

const isProd = process.env.NODE_ENV === "production";

export async function POST() {
  // Coba panggil backend untuk revoke; apapun hasilnya, cookie tetap dihapus.
  try {
    await serverFetch("/logout", { method: "POST" });
  } catch (e) {
    // Abaikan 401 (token kadaluarsa) maupun error jaringan;
    // tetap lanjut hapus cookie supaya sesi FE bersih.
    if (!(e instanceof ApiError)) {
      // do nothing
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 0,
  });
  return res;
}
