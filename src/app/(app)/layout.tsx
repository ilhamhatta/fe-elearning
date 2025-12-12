// src/app/(app)/layout.tsx
import { ReactNode } from "react";
import { apiJson } from "@/lib/apiGuard";
import ApiStatusProbe from "@/components/ApiStatusProbe";
import SidebarNav, { NavItem } from "@/components/layout/SidebarNav";
import MobileMenu from "@/components/layout/MobileMenu";

type User = { id: number; name?: string; role?: "dosen" | "mahasiswa" };

function navFor(
  role: "dosen" | "mahasiswa" | undefined,
  meId?: number
): NavItem[] {
  const base: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/courses", label: "Courses", icon: "BookOpen" },
    { href: "/materials", label: "Materials", icon: "FolderDown" },
    { href: "/assignments", label: "Assignments", icon: "ClipboardList" },
  ];
  return role === "dosen"
    ? [...base, { href: "/reports", label: "Reports", icon: "BarChart3" }]
    : [
        ...base,
        {
          href: `/reports/students/${meId ?? 0}`,
          label: "My Report",
          icon: "BarChart3",
        },
      ];
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const me = await apiJson<User>("/user", {}, { next: "/" });
  const items = navFor(me.role, me.id);

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Sidebar */}
      <SidebarNav user={{ name: me.name, role: me.role }} items={items} />

      {/* Main area — padding kiri harus match lebar sidebar (w-72) */}
      <div className="md:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileMenu
                user={{ name: me.name, role: me.role }}
                items={items}
              />
              <span className="text-sm font-medium text-gray-700">
                {me.role === "dosen" ? "Dosen" : "Mahasiswa"}
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white grid place-items-center text-sm font-semibold shadow">
              {me?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        {/* Banner status API */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <ApiStatusProbe />
        </div>

        {/* Page content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
