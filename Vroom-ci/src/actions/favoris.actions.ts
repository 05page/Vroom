import { api } from "@/src/lib/api"
import type { Favori } from "@/src/types"

/** Récupère la liste des véhicules mis en favori par l'utilisateur connecté. */
export const getFavoris = () => api.get<Favori[]>("/favoris")

/** Ajoute un véhicule aux favoris de l'utilisateur connecté. */
export const addFavori = (vehiculeId: string | number) =>
  api.post<Favori>(`/favoris/${vehiculeId}`, {})

/** Retire un véhicule des favoris de l'utilisateur connecté. */
export const removeFavori = (vehiculeId: string | number) =>
  api.delete<unknown>(`/favoris/${vehiculeId}`)
