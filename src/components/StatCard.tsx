// src/components/StatCard.tsx
"use client";
import type { ReactNode } from "react";

export default function StatCard({
  title,
  value,
  ariaLabel,
  icon,
}: {
  title: string;
  value: number | string;
  ariaLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      aria-label={ariaLabel ?? title}
      className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-gray-200 shadow-sm"
    >
      {icon ?? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600/10 to-fuchsia-600/10">
          <svg
            viewBox="0 0 20 20"
            className="h-3.5 w-3.5 text-gray-600"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="8" />
          </svg>
        </span>
      )}
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-base font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
