import type { RendezVousClient, StatutRendezVous, TypeRendezVous } from "@/types"

/**
 * Helpers du domaine « rendez-vous », pendant de `vehicule.ts`.
 * `utils.ts` reste réservé aux fonctions de présentation pures.
 */

/** Libellé et couleur des 5 valeurs de `rendez_vous.statut`. Le Record force à toutes les couvrir. */
export const STYLE_STATUT_RDV: Record<
  StatutRendezVous,
  { libelle: string; classes: string }
> = {
  en_attente: {
    libelle: "En attente",
    classes: "bg-secondary text-secondary-foreground",
  },
  confirmé: { libelle: "Confirmé", classes: "bg-accent text-accent-foreground" },
  refusé: { libelle: "Refusé", classes: "bg-destructive/10 text-destructive" },
  annulé: { libelle: "Annulé", classes: "bg-destructive/10 text-destructive" },
  terminé: { libelle: "Terminé", classes: "bg-foreground text-background" },
}

/** Libellé des 3 valeurs de `rendez_vous.type`. */
export const LIBELLES_TYPE_RDV: Record<TypeRendezVous, string> = {
  visite: "Visite",
  essai_routier: "Essai routier",
  premiere_rencontre: "Première rencontre",
}

/**
 * Un rendez-vous attend-il encore quelque chose du client ?
 *
 * Deux conditions, et les deux comptent : la date doit être devant, ET le statut
 * doit être vivant. Un RDV annulé prévu la semaine prochaine n'est pas « à
 * venir », c'est de l'historique — se fier à la seule date le remettrait en tête
 * de liste alors qu'il n'appelle plus aucune action.
 */
export function estAVenir(rdv: RendezVousClient): boolean {
  const vivant = rdv.statut === "en_attente" || rdv.statut === "confirmé"
  return vivant && new Date(rdv.date_heure).getTime() > Date.now()
}

/**
 * Le client peut-il annuler ce rendez-vous ?
 * `annuler()` refuse explicitement les RDV terminés (422). Les refusés et
 * annulés passeraient côté back, mais proposer le bouton n'aurait aucun sens.
 */
export function estAnnulable(rdv: RendezVousClient): boolean {
  return rdv.statut === "en_attente" || rdv.statut === "confirmé"
}

/**
 * Le client peut-il noter le vendeur depuis ce rendez-vous ?
 * `AvisController::store()` exige un RDV `terminé` appartenant au client, et
 * refuse en 409 si un avis existe déjà pour ce vendeur.
 */
export function peutLaisserAvis(rdv: RendezVousClient): boolean {
  return rdv.statut === "terminé" && !rdv.has_avis
}
