import type Echo from "laravel-echo"

// Echo<"reverb"> : on précise le broadcaster utilisé pour que TypeScript
// connaisse les méthodes disponibles (private, leave, etc.)
// En production NEXT_PUBLIC_PUSHER_KEY est défini → on utilise Pusher
// En développement NEXT_PUBLIC_REVERB_APP_KEY est défini → on utilise Reverb
const usePusher = !!process.env.NEXT_PUBLIC_PUSHER_KEY

type Broadcaster = "pusher" | "reverb"
let echoInstance: Echo<Broadcaster> | null = null

/**
 * Retourne l'instance Echo connectée.
 * - Développement : Reverb local (NEXT_PUBLIC_REVERB_*)
 * - Production    : Pusher (NEXT_PUBLIC_PUSHER_*)
 *
 * Utilise des imports dynamiques pour éviter les erreurs SSR.
 */
export async function getEcho(): Promise<Echo<Broadcaster>> {
  if (echoInstance) return echoInstance

  if (typeof window === "undefined") {
    throw new Error("getEcho() ne peut être appelé que côté client (navigateur)")
  }

  const [{ default: EchoClass }, { default: Pusher }] = await Promise.all([
    import("laravel-echo"),
    import("pusher-js"),
  ])

  ;(window as unknown as { Pusher: unknown }).Pusher = Pusher

  if (usePusher) {
    // ── Production : Pusher ──────────────────────────────────────────────────
    echoInstance = new EchoClass({
      broadcaster: "pusher",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/auth/broadcasting",
    })
  } else {
    // ── Développement : Reverb local ─────────────────────────────────────────
    echoInstance = new EchoClass({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/auth/broadcasting",
    })
  }

  return echoInstance
}

/**
 * Déconnecte Echo et libère la connexion WebSocket.
 * À appeler lors du logout pour ne pas laisser de connexion ouverte.
 */
export function disconnectEcho(): void {
  echoInstance?.disconnect()
  echoInstance = null
}
