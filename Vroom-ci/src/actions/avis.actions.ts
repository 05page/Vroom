import { api } from "@/src/lib/api"
import type { Avis, AvisVendeur } from "@/src/types"

/** Récupère tous les avis reçus par un vendeur, avec sa note moyenne. */
export const getAvisVendeur = (vendeurId: string | number) =>
  api.get<AvisVendeur>(`/avis/vendeur/${vendeurId}`)

/** Soumet un avis sur un vendeur après une transaction. */
export const createAvis = (data: {
  vendeur_id: string | number
  note: number
  commentaire?: string
}) => api.post<Avis>("/avis", data)
