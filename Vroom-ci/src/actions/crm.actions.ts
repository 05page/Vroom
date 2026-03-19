import { api } from "@/src/lib/api"
import type { CrmClient, CrmClientDetail, CrmNote } from "@/src/types"

/** Liste tous les clients du vendeur avec leurs stats. */
export const getCrmClients = () =>
  api.get<CrmClient[]>("/crm/clients")

/** Fiche complète d'un client. */
export const getCrmClientDetail = (clientId: string) =>
  api.get<CrmClientDetail>(`/crm/clients/${clientId}`)

/** Ajoute une note privée sur un client. */
export const addNote = (clientId: string, contenu: string) =>
  api.post<CrmNote>(`/crm/clients/${clientId}/notes`, { contenu })

/** Modifie une note. */
export const updateNote = (noteId: string, contenu: string) =>
  api.put<CrmNote>(`/crm/notes/${noteId}`, { contenu })

/** Supprime une note. */
export const deleteNote = (noteId: string) =>
  api.delete<void>(`/crm/notes/${noteId}`)
