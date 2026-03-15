import { api } from "@/src/lib/api"
import type { RendezVous } from "@/src/types"

/** Récupère les rendez-vous du client connecté. */
export const getMesRdv = () => api.get<RendezVous[]>("/rdv/mes-rdv")

/** Récupère les rendez-vous liés aux véhicules du vendeur connecté. */
export const getNosRdv = () => api.get<RendezVous[]>("/rdv/nos-rdv")

/** Crée un nouveau rendez-vous pour un véhicule. */
export const createRdv = (data: {
  vehicule_id: string | number
  date_heure: string
  type: RendezVous["type"]
  lieu?: string
  notes?: string
}) => api.post<RendezVous>("/rdv", data)

/** Annule un rendez-vous (côté client ou vendeur). */
export const annulerRdv = (id: string | number) =>
  api.post<RendezVous>(`/rdv/${id}/annuler`, {})

/** Confirme un rendez-vous (côté vendeur). */
export const confirmerRdv = (id: string | number) =>
  api.post<RendezVous>(`/rdv/${id}/confirmer`, {})

/** Refuse un rendez-vous (côté vendeur). */
export const refuserRdv = (id: string | number) =>
  api.post<RendezVous>(`/rdv/${id}/refuser`, {})

/** Marque un rendez-vous comme terminé (côté vendeur). */
export const terminerRdv = (id: string | number) =>
  api.post<RendezVous>(`/rdv/${id}/terminer`, {})
