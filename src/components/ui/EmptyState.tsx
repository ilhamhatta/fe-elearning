// src/components/ui/EmptyState.tsx
// Path: src/components/ui/EmptyState.tsx
"use client";

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center text-gray-700">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-20" />
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
      {actionLabel && actionHref && (
        <div className="mt-4">
          <a
            href={actionHref}
            className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            {actionLabel}
          </a>
        </div>
      )}
    </div>
  );
}
