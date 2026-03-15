import { api } from "@/src/lib/api"
import type { MesNotifs, Notifications } from "@/src/types"

/** Récupère toutes les notifications de l'utilisateur connecté. */
export const getMesNotifs = () => api.get<MesNotifs>("/notifications/mes-notifs")

/** Marque une notification spécifique comme lue. */
export const markAsRead = (id: string | number) =>
  api.post<Notifications>(`/notifications/${id}/read`, {})

/** Marque toutes les notifications de l'utilisateur comme lues. */
export const markAllAsRead = () =>
  api.post<unknown>("/notifications/read-all", {})
