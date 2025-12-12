// src/components/CopyLinkButton.tsx
"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyLinkButton({ href }: { href: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(location.origin + href);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
      aria-label="Salin tautan unduhan"
    >
      {done ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {done ? "Disalin" : "Copy link"}
    </button>
  );
}
