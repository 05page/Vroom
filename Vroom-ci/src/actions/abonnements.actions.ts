import { api } from "@/src/lib/api"
import type { Abonnement, PlanAbonnement } from "@/src/types"

/** Récupère les plans disponibles pour le rôle de l'utilisateur connecté. */
export const getPlans = () =>
  api.get<PlanAbonnement[]>("/abonnements/plans")

/** Récupère l'abonnement actif de l'utilisateur (null si aucun). */
export const getMonAbonnement = () =>
  api.get<Abonnement | null>("/abonnements/mon-abonnement")

/** Souscrit à un plan avec la périodicité choisie. */
export const souscrire = (plan_id: string, periodicite: "mensuel" | "annuel") =>
  api.post<Abonnement>("/abonnements/souscrire", { plan_id, periodicite })

/** Résilie l'abonnement actif. */
export const resilier = () =>
  api.post<void>("/abonnements/resilier", {})
