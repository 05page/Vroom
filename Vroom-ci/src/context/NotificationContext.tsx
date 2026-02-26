"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";
import { MesNotifs, Notifications } from "../types";
import { useUser } from "./UserContext";

interface NotificationContextType {
    notifications: Notifications[]
    unreadCount: number
    isLoading: boolean
    resetCount: () => void
    markAsRead: (id: number) => void
    markAllRead: () => void
}
const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notifications[]>([])
    const [isLoading, setIsLoading] = useState(true);
    // Récupère l'utilisateur connecté pour connaître son ID de canal WebSocket
    const { user } = useUser()

    useEffect(() => {
        setIsLoading(true)
        api.get<MesNotifs>("/notifications/mes-notifs")
            .then((res) => {
                const liste = res?.data?.notifications ?? []
                setNotifications(liste)
                setUnreadCount(liste.filter(n => !n.is_read).length)
            })
            .catch(() => setNotifications([]))
            .finally(() => setIsLoading(false))
    }, []);

    // Abonnement WebSocket : écoute les nouvelles notifs en temps réel via Reverb
    // Se déclenche uniquement quand user?.id change (connexion/déconnexion)
    useEffect(() => {
        if (!user?.id) return // pas d'utilisateur connecté = pas d'abonnement

        const userId = user.id

        async function connectEcho() {
            try {
                const { getEcho } = await import("../lib/echo")
                const echo = await getEcho()
                echo
                    .private(`notifications.${userId}`)
                    .listen(".notification.new", (e: { notification: Notifications }) => {
                        // Nouvelle notif reçue : on l'ajoute en tête de liste
                        setNotifications(prev => [e.notification, ...prev])
                        // Et on incrémente le compteur non-lu
                        setUnreadCount(prev => prev + 1)
                    })
            } catch (err) {
                console.error("Connexion WebSocket échouée :", err)
            }
        }

        connectEcho()

        // Cleanup : quitter le canal quand l'utilisateur change ou se déconnecte
        return () => {
            import("../lib/echo").then(({ getEcho }) =>
                getEcho().then(echo => echo.leave(`notifications.${userId}`)).catch(() => {})
            ).catch(() => {})
        }
    }, [user?.id])

    const resetCount = () => setUnreadCount(0)

    // Marque une notif comme lue côté backend puis met à jour l'état local
    const markAsRead = (id: number) => {
        api.post(`/notifications/${id}/read`, {}).catch(() => {})
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Marque toutes les notifs comme lues côté backend puis met à jour l'état local
    const markAllRead = () => {
        api.post("/notifications/read-all", {}).catch(() => {})
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    return (<NotificationContext.Provider value={{ notifications, isLoading, unreadCount, resetCount, markAsRead, markAllRead }}>
        {children}
    </NotificationContext.Provider>)
}

export function useNotification() {
    const ctx = useContext(NotificationContext)
    if (!ctx) throw new Error("useNotification doit être utilisé dans un NotificationProvider")
    return ctx
}