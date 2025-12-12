// src/components/layout/MobileMenu.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";
import { NavItem } from "./SidebarNav";
import LogoutButton from "./LogoutButton";

export default function MobileMenu({
  user,
  items,
}: {
  user: { name?: string; role?: "dosen" | "mahasiswa" };
  items: NavItem[];
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Kunci scroll body ketika menu terbuka
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Tombol di topbar */}
      <button
        type="button"
        aria-label="Buka menu"
        onClick={() => setOpen(true)}
        className="md:hidden rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Fullscreen menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Backdrop LEBIH GELAP + sedikit blur */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Panel fullscreen */}
        <div
          className={[
            "absolute inset-0 bg-white",
            "transition-transform duration-200 ease-out",
            open ? "translate-y-0" : "-translate-y-2",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white grid place-items-center text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="truncate text-sm font-medium text-gray-900">
                {user?.name ?? "Pengguna"}
              </div>
            </div>
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Isi scrollable */}
          <div className="flex h-[calc(100dvh-3.25rem)] flex-col overflow-y-auto px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <nav className="space-y-2">
              {items.map((it) => {
                const active =
                  pathname === it.href || pathname.startsWith(it.href + "/");
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "block rounded-2xl px-3 py-3 text-sm font-medium ring-1",
                      active
                        ? "bg-gradient-to-r from-indigo-600/10 to-fuchsia-600/10 ring-indigo-200 text-indigo-700"
                        : "bg-white ring-gray-200 hover:bg-gray-50 text-gray-700",
                    ].join(" ")}
                  >
                    {it.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-4">
              <LogoutButton className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Logout
              </LogoutButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
