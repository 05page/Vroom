import { api } from "@/src/lib/api"
import type { Alerte } from "@/src/types"

/** Récupère toutes les alertes de recherche de l'utilisateur connecté. */
export const getAlertes = () => api.get<Alerte[]>("/alertes")

/** Crée une nouvelle alerte de recherche de véhicule. */
export const createAlerte = (data: Omit<Alerte, "id" | "user_id" | "created_at">) =>
  api.post<Alerte>("/alertes", data)

/** Met à jour une alerte de recherche existante. */
export const updateAlerte = (id: string | number, data: Partial<Alerte>) =>
  api.put<Alerte>(`/alertes/${id}`, data)

/** Supprime une alerte de recherche par son identifiant. */
export const deleteAlerte = (id: string | number) =>
  api.delete<unknown>(`/alertes/${id}`)
