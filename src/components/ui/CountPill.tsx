// src/components/ui/CountPill.tsx
// Path: src/components/ui/CountPill.tsx
import type { ReactNode } from "react";

type Variant = "gradient" | "subtle";

/**
 * CountPill
 * - "gradient": badge full gradasi (default)
 * - "subtle"  : badge putih dengan aura gradasi tipis (opsional, kalau masih ingin)
 */
export default function CountPill({
  children,
  variant = "gradient",
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  if (variant === "subtle") {
    // versi lama (opsional)
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-gray-800 ring-1 ring-gray-200 bg-white">
        <span className="relative">
          <span className="absolute -inset-[3px] rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-20" />
          <span className="relative">{children}</span>
        </span>
      </span>
    );
  }

  // FULL GRADIENT
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-sm ring-1 ring-white/30 leading-none">
      {children}
    </span>
  );
}
