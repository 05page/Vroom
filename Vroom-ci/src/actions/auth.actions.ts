import { api } from "@/src/lib/api"
import type { User } from "@/src/types"

/** Récupère le profil de l'utilisateur connecté. */
export const getMe = () => api.get<User>("/me")

/** Met à jour les informations de profil de l'utilisateur connecté. */
export const updateProfile = (data: Partial<User>) =>
  api.put<User>("/me/update", data)

/** Met à jour les informations de contact de l'utilisateur connecté. */
export const updateContact = (data: { telephone?: string; adresse?: string }) =>
  api.put<User>("/me/contact", data)
