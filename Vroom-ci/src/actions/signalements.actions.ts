import { api } from "@/src/lib/api"

export interface Signalement {
  id: string
  user_id: string
  cible_type: string
  cible_id: string
  raison: string
  description?: string | null
  statut: "en_attente" | "traité" | "rejeté"
  created_at: string
}

/** Récupère les signalements soumis par l'utilisateur connecté. */
export const getMesSignalements = () =>
  api.get<Signalement[]>("/signalements/mes-signalements")

/** Soumet un nouveau signalement pour un véhicule ou un utilisateur. */
export const createSignalement = (data: {
  cible_type: string
  cible_id: string | number
  raison: string
  description?: string
}) => api.post<Signalement>("/signalements", data)
