// src/components/ui/AvatarInitial.tsx
// Ganti root dari <div> → <span> (inline-flex) agar valid di dalam <p>
export default function AvatarInitial({ name }: { name?: string }) {
  const initials =
    (name ?? "—")
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "—";

  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-bold text-white ring-2 ring-white shadow"
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
