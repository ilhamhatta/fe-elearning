// src/components/layout/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderDown,
  ClipboardList,
  BarChart3,
  LogOut,
} from "lucide-react";
import LogoutButton from "./LogoutButton";

export type NavItem = {
  href: string;
  label: string;
  icon:
    | "LayoutDashboard"
    | "BookOpen"
    | "FolderDown"
    | "ClipboardList"
    | "BarChart3";
};

const ICONS = {
  LayoutDashboard,
  BookOpen,
  FolderDown,
  ClipboardList,
  BarChart3,
} as const;

function normalizePath(p: string) {
  // hapus trailing slash kecuali root
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

function isActivePath(pathname: string, href: string) {
  const a = normalizePath(pathname);
  const b = normalizePath(href);
  return a === b || a.startsWith(b + "/");
}

export default function SidebarNav({
  user,
  items,
}: {
  user: { name?: string; role?: "dosen" | "mahasiswa" };
  items: NavItem[];
}) {
  const pathname = usePathname() || "/";

  return (
    <aside className="hidden md:block">
      {/* Lebar 18rem → cocok dengan md:pl-72 di layout */}
      <div className="fixed left-0 top-0 bottom-0 z-40 w-72 bg-white border-r border-gray-200">
        <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
          {/* User card */}
          <div className="rounded-2xl p-0.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow">
            <div className="rounded-2xl bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-sm font-semibold text-white">
                  {(user?.name?.[0] || "U").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {user?.name ?? "Pengguna"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.role === "dosen" ? "Dosen" : "Mahasiswa"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-2">
            {items.map((it) => {
              const Icon = ICONS[it.icon] ?? ICONS.LayoutDashboard; // fallback aman
              const active = isActivePath(pathname, it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                    active
                      ? "bg-gradient-to-r from-indigo-600/10 to-fuchsia-600/10 ring-indigo-200 text-indigo-700"
                      : "bg-white ring-gray-200 hover:bg-gray-50 text-gray-700",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{it.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer agar tombol logout selalu di bawah */}
          <div className="flex-1" />

          {/* Logout */}
          <LogoutButton className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <LogOut className="h-4 w-4" />
            Logout
          </LogoutButton>
        </div>
      </div>
    </aside>
  );
}
