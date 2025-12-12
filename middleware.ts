// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_PATHS = ["/login", "/register"];
const PUBLIC_PATHS = ["/maintenance", "/forbidden"];

/**
 * Aturan:
 * - Whitelist: /login, /register, /maintenance, /forbidden, aset statis, dan /api/*
 * - Belum login → redirect ke /login?next=<path+query>
 * - Sudah login → blokir akses /login & /register (redirect ke /dashboard)
 */
export function middleware(req: NextRequest) {
  // Hanya guard permintaan navigasi (GET/HEAD). Biarkan method lain (POST, dll.) lewat.
  if (req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.next();
  }

  const { pathname, search } = req.nextUrl;
  const hasToken = Boolean(req.cookies.get("auth_token")?.value);

  const isAuthPath = AUTH_PATHS.includes(pathname);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // halaman yang perlu login (semua kecuali auth/public)
  const requiresAuth = !isAuthPath && !isPublic;

  // Belum login → redirect ke /login?next=<path>
  if (!hasToken && requiresAuth) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Sertakan path + query agar kembali ke tujuan awal setelah login
    const nextParam = pathname + (search || "");
    loginUrl.searchParams.set("next", nextParam);
    return NextResponse.redirect(loginUrl);
  }

  // Sudah login → blokir /login & /register
  if (hasToken && isAuthPath) {
    const dash = req.nextUrl.clone();
    dash.pathname = "/dashboard";
    dash.search = "";
    return NextResponse.redirect(dash);
  }

  return NextResponse.next();
}

/**
 * Jalankan middleware untuk semua path KECUALI:
 * - /api/*
 * - /_next/static/*, /_next/image/*
 * - /favicon.ico, /robots.txt, /sitemap.xml
 * - file aset gambar umum
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)",
  ],
};
