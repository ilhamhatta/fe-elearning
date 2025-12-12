// src/lib/echo.ts
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    EchoInstance?: Echo<"reverb">;
    Pusher: typeof Pusher;
  }
}

export function getEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null;

  if (!window.EchoInstance) {
    window.Pusher = Pusher;

    const host =
      process.env.NEXT_PUBLIC_REVERB_HOST ?? window.location.hostname;
    const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? "8080");
    const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";

    window.EchoInstance = new Echo<"reverb">({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "local",
      wsHost: host, // ✅ penting
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/broadcasting/auth",
      withCredentials: true,
    });
  }

  return window.EchoInstance!;
}
