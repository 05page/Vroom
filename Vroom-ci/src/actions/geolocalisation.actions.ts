import { api } from "@/src/lib/api"

/** Représente un vendeur ou partenaire proche retourné par le backend */
export interface UserProche {
  id: string
  fullname: string
  role: "vendeur" | "concessionnaire" | "auto_ecole"
  adresse?: string
  avatar?: string
  /** Note moyenne sur 5 */
  note_moyenne?: number
  /** Nom commercial (concessionnaires / auto-écoles) */
  raison_sociale?: string
  latitude: number
  longitude: number
  /** Distance en kilomètres calculée côté backend */
  distance: number
}

/**
 * Récupère les vendeurs et partenaires dans un rayon donné autour d'une position.
 * @param lat Latitude du point de référence
 * @param lng Longitude du point de référence
 * @param rayon Rayon de recherche en kilomètres
 * @param role Filtre optionnel : "vendeur" | "concessionnaire" | "auto_ecole"
 */
export const getProches = (
  lat: number,
  lng: number,
  rayon: number,
  role?: string
) =>
  api.get<UserProche[]>(
    `/geo/proches?lat=${lat}&lng=${lng}&rayon=${rayon}${role ? `&role=${role}` : ""}`
  )

/**
 * Met à jour la position géographique de l'utilisateur connecté.
 * @param latitude Latitude GPS
 * @param longitude Longitude GPS
 */
export const updatePosition = (latitude: number, longitude: number) =>
  api.post<void>("/geo/position", { latitude, longitude })

/**
 * Géocode une adresse textuelle en coordonnées GPS.
 * @param adresse Adresse à convertir (ex: "Cocody, Abidjan")
 * @returns { latitude, longitude }
 */
export const geocodeAdresse = (adresse: string) =>
  api.post<{ latitude: number; longitude: number }>("/geo/geocode", { adresse })
