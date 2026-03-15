import { api } from "@/src/lib/api"
import type { User, vehicule } from "@/src/types"

// ---------------------------------------------------------------------------
// Types locaux admin (pas encore dans src/types/index.ts)
// ---------------------------------------------------------------------------

export interface AdminSignalement {
  id: string
  user_id: string
  cible_type: string
  cible_id: string
  raison: string
  description?: string | null
  statut: "en_attente" | "traité" | "rejeté"
  action_cible?: string | null
  note_admin?: string | null
  created_at: string
  user?: Pick<User, "id" | "fullname" | "email">
}

export interface AdminLog {
  id: string
  user_id: string
  action: string
  cible_type?: string | null
  cible_id?: string | null
  details?: string | null
  created_at: string
  user?: Pick<User, "id" | "fullname" | "email">
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convertit un objet params en query string.
 * Ex: { statut: "en_attente", page: "1" } → "?statut=en_attente&page=1"
 */
function buildQuery(params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) return ""
  return `?${new URLSearchParams(params).toString()}`
}

// ---------------------------------------------------------------------------
// Utilisateurs
// ---------------------------------------------------------------------------

/** Récupère la liste de tous les utilisateurs (clients, vendeurs, partenaires). */
export const getUsers = () => api.get<User[]>("/admin/users")

/**
 * Récupère les utilisateurs avec pagination et filtres optionnels.
 * Utiliser à la place de getUsers() quand la page a une pagination ou des filtres.
 * @param params - Ex: { page: "1", role: "vendeur", statut: "actif" }
 */
export const getUsersPaginated = (params?: Record<string, string>) =>
  api.get<import("@/src/types").PaginatedResponse<User>>(`/admin/users${buildQuery(params)}`)

/** Récupère la liste de tous les comptes admin. */
export const getAdmins = () => api.get<User[]>("/admin/admins")

/** Crée un nouveau compte administrateur. */
export const createAdmin = (data: { fullname: string; email: string; password: string }) =>
  api.post<User>("/admin/admins", data)

/** Suspend temporairement le compte d'un utilisateur. */
export const suspendreUser = (id: string | number) =>
  api.post<User>(`/admin/users/${id}/suspendre`, {})

/** Banni définitivement le compte d'un utilisateur. */
export const bannirUser = (id: string | number) =>
  api.post<User>(`/admin/users/${id}/bannir`, {})

/** Restaure un compte utilisateur suspendu ou banni. */
export const restaurerUser = (id: string | number) =>
  api.post<User>(`/admin/users/${id}/restaurer`, {})

/** Valide le compte d'un utilisateur en attente de vérification. */
export const validerUser = (id: string | number) =>
  api.post<User>(`/admin/users/${id}/valider`, {})

// ---------------------------------------------------------------------------
// Véhicules
// ---------------------------------------------------------------------------

/** Récupère tous les véhicules de la plateforme (admin). */
export const getVehicules = () => api.get<vehicule[]>("/admin/vehicules")

/** Récupère uniquement les véhicules en attente de validation. */
export const getVehiculesEnAttente = () =>
  api.get<vehicule[]>("/admin/vehicules/en-attente")

/** Valide un véhicule soumis par un vendeur. */
export const validerVehicule = (id: string | number) =>
  api.post<vehicule>(`/admin/vehicules/${id}/valider`, {})

/** Rejette un véhicule avec un motif obligatoire. */
export const rejeterVehicule = (id: string | number, data: { motif: string }) =>
  api.post<vehicule>(`/admin/vehicules/${id}/rejeter`, data)

// ---------------------------------------------------------------------------
// Signalements
// ---------------------------------------------------------------------------

/**
 * Récupère les signalements avec filtres optionnels.
 * @param params - Ex: { statut: "en_attente", cible_type: "vehicule" }
 */
export const getSignalements = (params?: Record<string, string>) =>
  api.get<AdminSignalement[]>(`/admin/signalements${buildQuery(params)}`)

/**
 * Récupère les signalements avec pagination et filtres optionnels.
 * Utiliser à la place de getSignalements() quand la page a une pagination.
 * @param params - Ex: { page: "1", statut: "en_attente" }
 */
export const getSignalementsPaginated = (params?: Record<string, string>) =>
  api.get<import("@/src/types").PaginatedResponse<AdminSignalement>>(`/admin/signalements${buildQuery(params)}`)

/** Traite un signalement (acceptation ou rejet avec note admin). */
export const traiterSignalement = (
  id: string | number,
  data: { statut: "traité" | "rejeté"; action_cible?: string; note_admin?: string }
) => api.post<AdminSignalement>(`/admin/signalements/${id}/traiter`, data)

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------

/**
 * Récupère les logs d'activité avec filtres optionnels.
 * @param params - Ex: { cible_type: "vehicule", user_id: "42" }
 */
export const getLogs = (params?: Record<string, string>) =>
  api.get<AdminLog[]>(`/admin/logs${buildQuery(params)}`)
