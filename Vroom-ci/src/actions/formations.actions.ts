import { api } from "@/src/lib/api"
import type { Formation, InscriptionFormation } from "@/src/types"

/** Catalogue public des formations validées. */
export const getFormations = () =>
  api.get<Formation[]>("/formations")

/** Détail d'une formation. */
export const getFormation = (id: string) =>
  api.get<Formation>(`/formations/${id}`)

/** Auto-école — ses formations. */
export const getMesFormations = () =>
  api.get<Formation[]>("/formations/mes-formations")

/** Auto-école — liste des inscrits d'une formation. */
export const getInscrits = (formationId: string) =>
  api.get<InscriptionFormation[]>(`/formations/${formationId}/inscrits`)

/** Crée une nouvelle formation (auto-école). */
export const createFormation = (data: {
  type_permis: string
  prix: number
  duree_heures: number
  titre: string
  texte: string
}) => api.post<Formation>("/formations", data)

/** Modifie une formation. */
export const updateFormation = (id: string, data: Partial<Formation & { titre: string; texte: string }>) =>
  api.put<Formation>(`/formations/${id}`, data)

/** Supprime une formation. */
export const deleteFormation = (id: string) =>
  api.delete<void>(`/formations/${id}`)

/** Auto-école met à jour le statut d'un élève. */
export const updateInscrit = (
  formationId: string,
  inscriptionId: string,
  data: { statut_eleve: string; date_examen?: string; reussite?: boolean }
) => api.put<InscriptionFormation>(`/formations/${formationId}/inscrits/${inscriptionId}`, data)

/** Client s'inscrit à une formation. */
export const sInscrire = (formationId: string) =>
  api.post<InscriptionFormation>(`/formations/${formationId}/inscrire`, {})

/** Client annule son inscription. */
export const annulerInscription = (formationId: string) =>
  api.delete<void>(`/formations/${formationId}/inscrire`)

/** Client consulte ses inscriptions. */
export const getMesInscriptions = () =>
  api.get<InscriptionFormation[]>("/formations/mes-inscriptions")
