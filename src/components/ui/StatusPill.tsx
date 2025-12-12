// src/components/ui/StatusPill.tsx
// Path: src/components/ui/StatusPill.tsx
"use client";
import { type ComponentProps, type ReactNode } from "react";

type Tone = "success" | "neutral";

export default function StatusPill({
  children,
  tone = "neutral",
  ...rest
}: { children: ReactNode; tone?: Tone } & ComponentProps<"span">) {
  const cls =
    tone === "success"
      ? "bg-green-50 text-green-700 ring-green-200"
      : "bg-gray-50 text-gray-700 ring-gray-200";
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}
    >
      {/* check icon */}
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M20 7 9 18l-5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}
