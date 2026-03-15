import { api } from "@/src/lib/api"
import type { VendeurStats } from "@/src/types"

/** Récupère les statistiques du vendeur connecté (ventes, vues, RDV, etc.). */
export const getMesStats = () => api.get<VendeurStats>("/stats/mes-stats")
