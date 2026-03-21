import { useEffect, useRef } from "react"
import { useUser } from "@/src/context/UserContext"
import { getEcho } from "@/src/lib/echo"

/**
 * Types de données qui peuvent être rafraîchies via Reverb.
 * Correspond au champ `type` dans le payload de l'event Laravel DataRefresh.
 */
export type DataRefreshType =
    | "rdv"
    | "formation"
    | "vehicule"
    | "transaction"
    | "crm"
    | "message"

/**
 * useDataRefresh
 *
 * Se connecte au canal privé `private-user.{userId}` via Laravel Echo/Reverb
 * et écoute l'event `.data.refresh`. Quand un event du bon `type` est reçu,
 * le callback `onRefresh` est appelé.
 *
 * Utilise un import dynamique de getEcho pour éviter les erreurs SSR
 * (Echo accède à `window`).
 *
 * @param type       - le type de données à surveiller (ex: "rdv")
 * @param onRefresh  - callback appelé quand un refresh de ce type est reçu
 *
 * @example
 * const fetchData = useCallback(async () => { ... }, [])
 * useDataRefresh("rdv", fetchData)
 */
export function useDataRefresh(type: DataRefreshType, onRefresh: () => void): void {
    const { user } = useUser()

    // Ref stable vers le callback pour éviter de se réabonner à chaque render
    const onRefreshRef = useRef(onRefresh)
    useEffect(() => {
        onRefreshRef.current = onRefresh
    }, [onRefresh])

    useEffect(() => {
        // On ne peut pas s'abonner si l'utilisateur n'est pas encore chargé
        if (!user?.id) return

        const userId = user.id
        let isMounted = true

        // Variable pour stocker le channel Echo afin de pouvoir unsubscribe au cleanup
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let channel: any = null

        const subscribe = async () => {
            try {
                const echo = await getEcho()
                if (!isMounted) return

                // Canal privé : Laravel vérifie les droits via channels.php
                // `private-user.{id}` correspond au canal `user.{id}` dans channels.php
                channel = echo.private(`user.${userId}`)

                /**
                 * Écoute l'event `.data.refresh` (le point devant le nom signifie
                 * qu'on utilise le nom exact de l'event, sans le namespace Laravel).
                 * Le payload contient `{ type: DataRefreshType }`.
                 */
                channel.listen(".data.refresh", (payload: { type: DataRefreshType }) => {
                    if (payload.type === type) {
                        onRefreshRef.current()
                    }
                })
            } catch (err) {
                // En SSR ou si Reverb n'est pas disponible, on ignore silencieusement
                if (process.env.NODE_ENV === "development") {
                    console.warn(`[useDataRefresh] Impossible de se connecter à Reverb:`, err)
                }
            }
        }

        subscribe()

        return () => {
            isMounted = false
            // Quitte le canal proprement pour libérer la connexion WebSocket
            if (channel) {
                try {
                    getEcho().then(echo => echo.leave(`user.${userId}`))
                } catch {
                    // Ignore les erreurs au démontage
                }
            }
        }
    // On se réabonne uniquement si l'userId ou le type change
    }, [user?.id, type])
}
