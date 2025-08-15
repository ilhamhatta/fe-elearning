// middleware.ts (root project)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const url = req.nextUrl.clone();
  const { pathname, search } = url;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isApi = pathname.startsWith("/api");
  const isAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (isApi || isAsset) return NextResponse.next();

  // Belum login -> lempar ke login (dengan ?next)
  if (!token && !isAuthPage) {
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Sudah login -> arahkan dari /login & /register ke dashboard (cepat)
  if (token && isAuthPage) {
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|api).*)"],
};
