// src/app/(app)/discussions/[id]/ChatClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getEcho } from "@/lib/echo";

type Author = { id: number; name: string; email: string };
type Msg = {
  id: number;
  body: string;
  created_at: string;
  author: Author;
  pending?: boolean;
};
type RepliesResp = {
  data: Msg[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};
// ⬇️ tipe payload event agar tidak pakai `any`
type ReplyCreatedEvent = {
  id: number;
  body: string;
  created_at: string;
  author: Author;
};

export default function ChatClient({
  discussionId,
  currentUserId,
  initialMessages,
  initialPage,
  lastPage,
}: {
  discussionId: number;
  currentUserId: number;
  initialMessages: Msg[];
  initialPage: number;
  lastPage: number;
}) {
  const [messages, setMessages] = useState<Msg[]>(() => {
    const seen = new Set<number>();
    const out: Msg[] = [];
    for (const m of initialMessages) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        out.push(m);
      }
    }
    return out;
  });

  const [page, setPage] = useState<number>(initialPage);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const atFirstPage = page <= 1;
  const canLoadOlder = !atFirstPage;

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // ⬇️ hapus variabel `ch` (unused) + ganti `any` → `ReplyCreatedEvent`
  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const chName = `discussion.${discussionId}.replies`;

    echo
      .private(chName)
      .subscribed(() => console.log("SUBSCRIBED:", chName))
      .error((err: unknown) => console.error("CHANNEL ERROR:", chName, err))
      .listen(".ReplyCreated", (e: ReplyCreatedEvent) => {
        setMessages((prev) =>
          prev.some((m) => m.id === e.id)
            ? prev
            : [
                ...prev,
                {
                  id: e.id,
                  body: e.body,
                  created_at: e.created_at,
                  author: e.author,
                },
              ]
        );
        requestAnimationFrame(scrollToBottom);
      });

    return () => {
      echo.leave(`private-${chName}`);
    };
  }, [discussionId, scrollToBottom]);

  const loadOlder = useCallback(async () => {
    if (!canLoadOlder || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const prevPage = page - 1;
      const res = await fetch(
        `/api/discussions/${discussionId}/replies?page=${prevPage}&per_page=20`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error(await res.text());
      const json: RepliesResp = (await res.json()) as RepliesResp;

      const el = listRef.current;
      const beforeHeight = el?.scrollHeight ?? 0;

      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id));
        const olderUnique = json.data.filter((m) => !existing.has(m.id));
        return [...olderUnique, ...prev];
      });

      setPage(prevPage);

      requestAnimationFrame(() => {
        if (!el) return;
        const afterHeight = el.scrollHeight;
        el.scrollTop = afterHeight - beforeHeight;
      });
    } catch (err) {
      console.error(err);
      alert("Gagal memuat pesan sebelumnya");
    } finally {
      setLoadingOlder(false);
    }
  }, [canLoadOlder, loadingOlder, page, discussionId]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const tempId = -Date.now();
      const pending: Msg = {
        id: tempId,
        body: text,
        created_at: new Date().toISOString(),
        author: { id: currentUserId, name: "You", email: "" },
        pending: true,
      };
      setMessages((prev) => [...prev, pending]);
      requestAnimationFrame(scrollToBottom);

      try {
        const res = await fetch(`/api/discussions/${discussionId}/replies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message ?? "Gagal mengirim");

        setMessages((prev) => {
          const realId = json.data.id as number;

          // kalau event realtime sudah masuk duluan (id sama), buang dulu yang realId
          const cleaned = prev.filter((m) => m.id !== realId);

          return cleaned.map((m) =>
            m.id === tempId
              ? {
                  id: realId,
                  body: json.data.body as string,
                  created_at: json.data.created_at as string,
                  author: {
                    id: currentUserId,
                    name: json.data.author?.name ?? "You",
                    email: json.data.author?.email ?? "",
                  },
                }
              : m
          );
        });
        requestAnimationFrame(scrollToBottom);
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        alert(e instanceof Error ? e.message : "Gagal mengirim");
      }
    },
    [currentUserId, discussionId, scrollToBottom]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-2xl ring-1 ring-gray-200 shadow bg-white">
      <div className="flex items-center justify-center p-2 border-b">
        <button
          onClick={loadOlder}
          disabled={!canLoadOlder || loadingOlder}
          className="text-xs rounded-full border px-3 py-1 disabled:opacity-50"
          aria-label="Muat pesan lebih lama"
          title="Muat pesan lebih lama"
        >
          {loadingOlder
            ? "Memuat..."
            : canLoadOlder
            ? "Muat pesan sebelumnya"
            : "Sudah di awal"}
        </button>
        <span className="sr-only">{`Halaman ${page} dari ${lastPage}`}</span>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-white"
      >
        {messages.map((m) => {
          const mine = m.author.id === currentUserId || m.author.name === "You";
          return <MessageBubble key={m.id} mine={mine} msg={m} />;
        })}
        <div aria-hidden className="h-1" />
      </div>

      <div className="border-t p-3">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}

function MessageBubble({ mine, msg }: { mine: boolean; msg: Msg }) {
  const [time, setTime] = useState<string>(""); // SSR & initial client sama: ""

  useEffect(() => {
    setTime(
      new Date(msg.created_at).toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      })
    );
  }, [msg.created_at]);

  if (mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="text-right text-[11px] text-gray-500 mb-1">
            {time}
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-4 py-2 shadow">
            <p className="whitespace-pre-wrap break-words">{msg.body}</p>
            {msg.pending && (
              <div className="mt-1 text-[10px] opacity-80">mengirim…</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar name={msg.author.name} />
      <div className="max-w-[75%]">
        <div className="text-[11px] text-gray-600 mb-1">
          {msg.author.name} • {time}
        </div>
        <div className="rounded-2xl ring-1 ring-gray-200 px-4 py-2 shadow-sm bg-white">
          <p className="whitespace-pre-wrap break-words text-gray-900">
            {msg.body}
          </p>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = (name || "?")
    .split(" ")
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
  return (
    <div className="h-8 w-8 rounded-full bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center text-xs text-gray-700">
      {initials || "?"}
    </div>
  );
}

function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState("");

  return (
    <form
      action="#"
      onSubmit={(e) => {
        e.preventDefault();
        onSend(val);
        setVal("");
        taRef.current?.focus();
      }}
      className="flex items-end gap-2"
    >
      <label htmlFor="chat-input" className="sr-only">
        Ketik pesan
      </label>
      <textarea
        id="chat-input"
        ref={taRef}
        required
        minLength={1}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
          }
        }}
        placeholder="Tulis pesan… (Enter untuk kirim, Shift+Enter baris baru)"
        className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        rows={1}
        aria-label="Ketik pesan"
      />
      <button
        type="submit"
        className="rounded-2xl px-4 py-2 text-white shadow bg-gradient-to-r from-indigo-500 to-fuchsia-500 disabled:opacity-50"
        disabled={!val.trim()}
        aria-label="Kirim pesan"
      >
        Kirim
      </button>
    </form>
  );
}
