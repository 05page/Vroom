import type Echo from "laravel-echo"

// Echo<"reverb"> : on précise le broadcaster utilisé pour que TypeScript
// connaisse les méthodes disponibles (private, leave, etc.)
let echoInstance: Echo<"reverb"> | null = null

/**
 * Retourne l'instance Echo connectée au serveur Reverb.
 * Crée la connexion au premier appel, retourne le singleton ensuite.
 *
 * Utilise des imports dynamiques pour éviter les erreurs SSR :
 * pusher-js et laravel-echo accèdent à `window`, qui n'existe pas côté serveur (Next.js).
 */
export async function getEcho(): Promise<Echo<"reverb">> {
  // Si l'instance existe déjà, on la retourne directement (pas de reconnexion)
  if (echoInstance) return echoInstance

  // Guard SSR : on ne peut pas créer une connexion WebSocket sans navigateur
  if (typeof window === "undefined") {
    throw new Error("getEcho() ne peut être appelé que côté client (navigateur)")
  }

  // Import dynamique : ces modules ne sont chargés QUE dans le navigateur
  const [{ default: EchoClass }, { default: Pusher }] = await Promise.all([
    import("laravel-echo"),
    import("pusher-js"),
  ])

  // Laravel Echo attend que Pusher soit disponible sur window
  // Double cast via unknown : TypeScript interdit de caster directement Window
  // vers un type incompatible, on passe par unknown pour forcer l'assignation
  ;(window as unknown as { Pusher: unknown }).Pusher = Pusher

  // Création de la connexion Echo vers le serveur Reverb
  echoInstance = new EchoClass({
    broadcaster: "reverb", // Reverb utilise le protocole Pusher en interne

    // Clé publique de l'app Reverb (doit correspondre à REVERB_APP_KEY backend)
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,

    // Adresse du serveur Reverb (ws://localhost:8080 en développement)
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),

    // forceTLS = true uniquement en HTTPS (production), false en HTTP (développement)
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",

    // On active uniquement WebSocket (ws/wss), pas de fallback Sockjs
    enabledTransports: ["ws", "wss"],

    // Route Next.js qui proxifie l'authentification des canaux privés vers Laravel.
    // Echo envoie un POST ici avec socket_id + channel_name pour vérifier les droits.
    authEndpoint: "/api/auth/broadcasting",
  })

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
