import { useEffect, useRef } from "react"

/**
 * useRevalidateOnFocus
 *
 * Appelle `refresh` automatiquement dans deux situations :
 *  1. L'utilisateur revient sur l'onglet (visibilitychange → visible)
 *  2. La fenêtre reprend le focus (window focus)
 *
 * Un debounce de 2 secondes évite les doubles appels quand les deux
 * événements se déclenchent en même temps (ce qui est fréquent).
 *
 * @param refresh  - callback à appeler pour recharger les données
 * @param enabled  - désactiver le hook sans le démonter (défaut : true)
 *
 * @example
 * const fetchData = useCallback(async () => { ... }, [])
 * useRevalidateOnFocus(fetchData)
 */
export function useRevalidateOnFocus(
    refresh: () => void,
    enabled: boolean = true,
): void {
    // useRef pour stocker le timer sans provoquer de re-render
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // On garde une ref stable vers `refresh` pour éviter de recréer
    // les listeners à chaque render si la référence de la fonction change.
    const refreshRef = useRef(refresh)
    useEffect(() => {
        refreshRef.current = refresh
    }, [refresh])

    useEffect(() => {
        if (!enabled) return

        /**
         * Lance un appel à refresh avec un debounce de 2s.
         * Si la fonction est rappelée avant la fin du délai,
         * le timer précédent est annulé (pas de double fetch).
         */
        const debouncedRefresh = () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                refreshRef.current()
            }, 2000)
        }

        // Handler visibilitychange : déclenché quand l'utilisateur
        // revient sur l'onglet après l'avoir mis en arrière-plan.
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                debouncedRefresh()
            }
        }

        // Handler focus : déclenché quand la fenêtre reprend le focus
        // (ex: l'utilisateur revient d'une autre application).
        const handleFocus = () => {
            debouncedRefresh()
        }

        document.addEventListener("visibilitychange", handleVisibility)
        window.addEventListener("focus", handleFocus)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility)
            window.removeEventListener("focus", handleFocus)
            // Nettoyage du timer en cours au démontage
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [enabled])
}
