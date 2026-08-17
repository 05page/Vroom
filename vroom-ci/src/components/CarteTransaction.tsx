import Link from "next/link";
import { CalendarRange, Car, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  cn,
  formaterDateCourte,
  formaterFcfa,
  initiales,
  urlPhoto,
} from "@/lib/utils";
import { libelleVehicule, photoPrincipale } from "@/lib/vehicule";
import type { TransactionConclue } from "@/types";

/**
 * Un véhicule réellement acheté, loué ou vendu, rendu à l'identique des deux côtés.
 *
 * `mes-demandes` (client) et `mes-transactions` (vendeur) renvoient le MÊME
 * modèle : seule la relation chargée diffère, `vendeur` d'un côté, `client` de
 * l'autre. D'où `perspective`, qui choisit la contrepartie à lire et le verbe à
 * afficher. Deux composants jumeaux auraient divergé au premier changement.
 */
export type CarteTransactionProps = {
  transaction: TransactionConclue;
  perspective: "client" | "vendeur";
};

/** Verbe affiché selon le camp et la nature du deal. */
const VERBES: Record<"client" | "vendeur", Record<"vente" | "location", string>> =
  {
    client: { vente: "Acheté à", location: "Loué auprès de" },
    vendeur: { vente: "Vendu à", location: "Loué à" },
  };

/** Libellé du badge posé sur la photo : un achat vu du client est une vente vue du vendeur. */
const LIBELLES_NATURE: Record<
  "client" | "vendeur",
  Record<"vente" | "location", string>
> = {
  client: { vente: "Achat", location: "Location" },
  vendeur: { vente: "Vente", location: "Location" },
};

export default function CarteTransaction({
  transaction,
  perspective,
}: CarteTransactionProps) {
  const { vehicule, type, statut } = transaction;

  // une seule des deux relations est chargée, selon l'endpoint qui a produit la donnée
  const contrepartie =
    perspective === "client" ? transaction.vendeur : transaction.client;

  const libelle = libelleVehicule(vehicule.description, vehicule.id);
  const photo = photoPrincipale(vehicule.photos);

  const estLocation = type === "location";

  return (
    <article className="group overflow-hidden rounded-2xl border border-border transition-colors hover:border-primary">
      <div className="relative aspect-16/10 bg-muted">
        {photo ? (
          // <img> et non <Image> : les photos viennent du backend, absent des remotePatterns
          <img
            src={urlPhoto(photo.path)}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <Car className="size-10" />
          </span>
        )}

        <Badge
          className={cn(
            "absolute left-3 top-3",
            estLocation
              ? "bg-background text-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {LIBELLES_NATURE[perspective][type]}
        </Badge>

        {/* les listes sont filtrées sur "confirmé" : ce badge ne sort que si un appelant oublie de filtrer */}
        {statut !== "confirmé" && (
          <Badge variant="outline" className="absolute right-3 top-3 bg-background">
            {statut}
          </Badge>
        )}
      </div>

      <div className="p-5">
        <h3 className="truncate font-heading text-lg font-bold">{libelle}</h3>

        <p className="mt-1 font-semibold tabular-nums">
          {/* Number() obligatoire : `prix_final` est une string, un + concatènerait */}
          {formaterFcfa(Number(transaction.prix_final))}
          {estLocation && (
            <span className="font-normal text-muted-foreground"> / jour</span>
          )}
        </p>

        {/* les deux dates ne sont renseignées que sur une location */}
        {estLocation && transaction.date_debut_location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarRange className="size-3.5 shrink-0" />
            {formaterDateCourte(transaction.date_debut_location)}
            {transaction.date_fin_location &&
              ` → ${formaterDateCourte(transaction.date_fin_location)}`}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          {contrepartie ? (
            <>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initiales(contrepartie.fullname)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">
                  {VERBES[perspective][type]}
                </span>
                <Link
                  href={`/vendeurs/${contrepartie.id}`}
                  className="lien-anime block truncate text-sm font-semibold hover:text-primary"
                >
                  {contrepartie.fullname}
                </Link>
              </span>
            </>
          ) : (
            <span className="flex-1 text-xs text-muted-foreground">
              Contrepartie non chargée
            </span>
          )}

          <Link
            href={`/vehicules/${vehicule.id}`}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
            aria-label={`Voir la fiche de ${libelle}`}
          >
            Fiche
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Conclu le {formaterDateCourte(transaction.created_at)}
        </p>
      </div>
    </article>
  );
}
