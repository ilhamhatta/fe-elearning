// src/components/materials/MaterialCard.tsx
// (kalau belum dibuat di FE-mu, ini versi server component yang kita pakai bersama)
import type { ReactNode } from "react";

type MaterialItem = {
  id: number;
  name: string;
  filename: string | null;
  size: number;
  mime: string | null;
  uploaded_at: string | null;
  download_count: number;
  course?: { id: number; name: string | null };
};

export default function MaterialCard({
  m,
  actions,
}: {
  m: MaterialItem;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200">
          {fileBadge(m.mime ?? m.filename ?? "")}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">
            {m.name}
          </div>
          <div className="truncate text-xs text-gray-500">
            {m.filename ?? "—"}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-600">
            <span>{formatBytes(m.size)}</span>
            {typeof m.download_count === "number" && (
              <>
                <span>•</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                  {m.download_count} unduhan
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <a
          href={`/api/materials/${m.id}/download`}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        >
          Download
        </a>
        {actions}
      </div>
    </div>
  );
}

function formatBytes(n: number) {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0,
    v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}
function fileBadge(mimeOrName: string) {
  const s = mimeOrName.toLowerCase();
  if (s.includes("pdf") || s.endsWith(".pdf")) return "PDF";
  if (s.includes("word") || s.endsWith(".doc") || s.endsWith(".docx"))
    return "DOC";
  if (s.includes("powerpoint") || s.endsWith(".ppt") || s.endsWith(".pptx"))
    return "PPT";
  if (s.includes("excel") || s.endsWith(".xls") || s.endsWith(".xlsx"))
    return "XLS";
  if (s.includes("zip") || s.endsWith(".zip")) return "ZIP";
  if (s.includes("mp4") || s.endsWith(".mp4")) return "MP4";
  return "FILE";
}
