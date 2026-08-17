"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

import BadgeEcartPrix from "@/components/BadgeEcartPrix";
import BoutonRecharger from "@/components/BoutonRecharger";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cn,
  formaterDateCourte,
  formaterFcfa,
  initiales,
  urlPhoto,
} from "@/lib/utils";
import { libelleVehicule, STYLE_DOCUMENT, STYLE_HISTORIQUE } from "@/lib/vehicule";
import type { StatutDocument, VehiculeFiche } from "@/types";

/* ────────────────────────────────────────────────────────────────────────────
   FICHE VÉHICULE — /vehicules/[id]
   Miroir de VehiculesController::vehicule() (vroom-backend, routes/api.php:50).
   Route PUBLIQUE : pas de token requis pour la consulter.
   ──────────────────────────────────────────────────────────────────────────── */

/** Next 16 : `params` est une Promise, même dans une page Client Component — on la déballe avec `use()`. */
type ParametresPage = { params: Promise<{ id: string }> };

/** Même contrat que GET /api/vehicules/{id} : seul ce corps changera au branchement. */
const recupererVehiculeFiche = (id: string): Promise<VehiculeFiche | null> => {
  // 1. Déclare un tableau `vehicules: VehiculeFiche[]` d'au moins DEUX véhicules.
  const vehicules: VehiculeFiche[] = [
    {
      id: "2c1d0e9f-8a7b-4c6d-9e5f-4a3b2c1d0e9f",
      created_by: "b1a2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
      post_type: "vente",
      type: "occasion",
      statut: "disponible",
      prix: "18750000.00",
      prix_suggere: "17900000.00",
      negociable: true,
      date_disponibilite: null,
      status_validation: "validee",
      views_count: 342,
      created_at: "2026-03-02T09:14:00Z",
      photos: [
        { id: "f1a2b3c4-6d5e-4f7a-8b9c-0d1e2f3a4b5c", path: "/toyota.jpeg", is_primary: true, position: 0 },
      ],
      creator: {
        id: "b1a2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
        fullname: "Koffi Aristide",
        email: "koffi.aristide@example.com",
      },
      description: {
        marque: "Toyota",
        modele: "RAV4",
        annee: 2021,
        kilometrage: 42000,
        carburant: "Essence",
        transmission: "Automatique",
        carrosserie: "SUV",
        couleur: "Gris Titane",
        nombre_portes: 5,
        nombre_places: 5,
        visite_technique: "à_jour",
        date_visite_technique: "2026-03-12",
        carte_grise: "à_jour",
        date_carte_grise: "2021-06-20",
        assurance: "à_jour",
        historique_accidents: "aucun",
        equipements: ["Climatisation", "GPS", "Caméra de recul"],
      },
    },
    {
      id: "7f3e9c1a-2b4d-4f6e-8a1c-9d5b3e7f1a2c",
      created_by: "4d5e6f7a-8b9c-4d1e-9f2a-3b4c5d6e7f8a",
      post_type: "location",
      type: "neuf",
      statut: "a_venir",
      prix: "25000.00",
      prix_suggere: null,
      negociable: false,
      date_disponibilite: "2026-09-01",
      status_validation: "validee",
      views_count: 0,
      created_at: "2026-08-10T14:00:00Z",
      photos: [],
      creator: {
        id: "4d5e6f7a-8b9c-4d1e-9f2a-3b4c5d6e7f8a",
        fullname: "Assane Diallo",
      },
      description: {
        marque: "Nissan",
        modele: "Micra",
        annee: 2026,
        kilometrage: null,
        carburant: null,
        transmission: null,
        carrosserie: null,
        couleur: null,
        nombre_portes: null,
        nombre_places: null,
        visite_technique: null,
        date_visite_technique: null,
        carte_grise: null,
        date_carte_grise: null,
        assurance: null,
        historique_accidents: null,
        equipements: null,
      },
    },
  ]

  // 2. Cherche, dans ce tableau, l'élément dont `id` correspond au paramètre
  //    Exemple : `vehicules.find((v) => v.id === id)`.
  const vehiculeTrouve = vehicules.find((v) => v.id === id);
  const trouve = vehiculeTrouve === undefined ? null : vehiculeTrouve
  // 4. Enveloppe ce résultat (celui de l'étape 3, pas du tableau brut) dans
  //    une `Promise` : `new Promise((resolve) => ...)
  return new Promise((resolve) => setTimeout(() => resolve(trouve), 700));
};

export default function PageFicheVehicule({ params }: ParametresPage) {
  const { id } = use(params);
  // `key={id}` démonte/remonte FicheVehicule à chaque changement d'id : plus
  // simple et plus sûr qu'un reset manuel de l'état dans un useEffect.
  return <FicheVehicule key={id} id={id} />;
}

function FicheVehicule({ id }: { id: string }) {
  const [vehicule, setVehicule] = useState<VehiculeFiche | null | undefined>(
    undefined
  );
  const [photoActive, setPhotoActive] = useState(0);
  const [estFavori, setEstFavori] = useState(false);
  // incrémenté par le bouton Recharger : c'est ce qui redéclenche le useEffect ci-dessous
  const [tentative, setTentative] = useState(0);
  // distinct de `vehicule === undefined` : un rechargement manuel garde l'ancienne
  // fiche affichée pendant l'appel, seule l'icône du bouton tourne
  const [rechargement, setRechargement] = useState(false);

  useEffect(() => {
    let annule = false;

    recupererVehiculeFiche(id).then((resultat) => {
      if (annule) return;
      setVehicule(resultat);
      setRechargement(false);
    });

    return () => {
      annule = true;
    };
  }, [id, tentative]);

  const recharger = () => {
    setRechargement(true);
    setTentative((t) => t + 1);
  };

  if (vehicule === undefined) return <SkeletonFiche />;
  if (vehicule === null) return <FicheIntrouvable />;

  const description = vehicule.description;
  const libelle = libelleVehicule(description, vehicule.id);
  const photos = vehicule.photos;
  const estLocation = vehicule.post_type === "location";
  const photo = photos[photoActive] ?? photos[0];

  const specs = (
    description
      ? [
        description.annee && { libelle: "Année", valeur: String(description.annee) },
        description.kilometrage != null && {
          libelle: "Kilométrage",
          valeur: `${description.kilometrage.toLocaleString("fr-FR")} km`,
        },
        description.carburant && { libelle: "Carburant", valeur: description.carburant },
        description.transmission && {
          libelle: "Transmission",
          valeur: description.transmission,
        },
        description.carrosserie && {
          libelle: "Carrosserie",
          valeur: description.carrosserie,
        },
        description.couleur && { libelle: "Couleur", valeur: description.couleur },
        description.nombre_portes != null && {
          libelle: "Portes",
          valeur: String(description.nombre_portes),
        },
        description.nombre_places != null && {
          libelle: "Places",
          valeur: String(description.nombre_places),
        },
      ]
      : []
  ).filter((spec): spec is { libelle: string; valeur: string } => Boolean(spec));

  type DocumentAffiche = { libelle: string; statut: StatutDocument; date: string | null };

  const documents = (
    description
      ? [
        {
          libelle: "Visite technique",
          statut: description.visite_technique,
          date: description.date_visite_technique,
        },
        {
          libelle: "Carte grise",
          statut: description.carte_grise,
          date: description.date_carte_grise,
        },
        { libelle: "Assurance", statut: description.assurance, date: null },
      ]
      : []
  ).filter((doc): doc is DocumentAffiche => doc.statut !== null);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/vehicules"
          className="lien-anime inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Retour au catalogue
        </Link>
        <BoutonRecharger onClick={recharger} chargement={rechargement} />
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-10">
        <div>
          <header>
            <Link
              href={`/vendeurs/${vehicule.creator.id}`}
              className="group inline-flex items-center gap-2.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initiales(vehicule.creator.fullname)}
              </span>
              <span className="text-sm text-muted-foreground">
                Proposé par{" "}
                <span className="lien-anime font-semibold text-foreground group-hover:text-primary">
                  {vehicule.creator.fullname}
                </span>
              </span>
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  estLocation
                    ? "bg-background text-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {estLocation ? "Location" : "Vente"}
              </Badge>
              {vehicule.type === "neuf" && (
                <Badge className="bg-accent text-accent-foreground">Neuf</Badge>
              )}
            </div>

            <h1 className="mt-3 font-heading text-3xl font-bold">{libelle}</h1>

            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="size-3.5" />
              {vehicule.views_count.toLocaleString("fr-FR")} vue
              {vehicule.views_count > 1 ? "s" : ""}
            </p>
          </header>

          <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl bg-muted">
            {photo ? (
              // <img> et non <Image> : les photos viennent du backend, absent des remotePatterns
              <img
                src={urlPhoto(photo.path)}
                alt={libelle}
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-muted-foreground">
                <Car className="size-16" />
              </span>
            )}

            {vehicule.statut === "a_venir" && (
              <Badge className="absolute left-4 top-4 gap-1 bg-foreground text-background">
                <Clock className="size-3" />
                Bientôt disponible
              </Badge>
            )}

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoActive((i) => (i - 1 + photos.length) % photos.length)
                  }
                  aria-label="Photo précédente"
                  className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur hover:text-primary"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoActive((i) => (i + 1) % photos.length)}
                  aria-label="Photo suivante"
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur hover:text-primary"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="sans-barre-scroll mt-3 flex gap-2 overflow-x-auto">
              {photos.map((p, index) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPhotoActive(index)}
                  aria-current={index === photoActive}
                  aria-label={`Photo ${index + 1}`}
                  className={cn(
                    "size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                    index === photoActive
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={urlPhoto(p.path)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {specs.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl border border-border p-5 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.libelle}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {spec.libelle}
                  </dt>
                  <dd className="mt-1 font-heading text-base font-bold">{spec.valeur}</dd>
                </div>
              ))}
            </dl>
          )}

          {description?.equipements && description.equipements.length > 0 && (
            <section className="mt-8">
              <h2 className="font-heading text-lg font-bold">Équipements</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {description.equipements.map((equipement) => (
                  <Badge key={equipement} variant="outline">
                    {equipement}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {(documents.length > 0 || description?.historique_accidents) && (
            <section className="mt-8">
              <h2 className="font-heading text-lg font-bold">Papiers &amp; historique</h2>
              <div className="mt-3 space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.libelle}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                  >
                    <span className="text-sm font-medium">{doc.libelle}</span>
                    <span className="flex items-center gap-2">
                      {doc.date && (
                        <span className="text-xs text-muted-foreground">
                          {formaterDateCourte(doc.date)}
                        </span>
                      )}
                      <Badge className={STYLE_DOCUMENT[doc.statut].classes}>
                        {STYLE_DOCUMENT[doc.statut].libelle}
                      </Badge>
                    </span>
                  </div>
                ))}

                {description?.historique_accidents && (
                  <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <span className="text-sm font-medium">Historique accidents</span>
                    <Badge className={STYLE_HISTORIQUE[description.historique_accidents].classes}>
                      {STYLE_HISTORIQUE[description.historique_accidents].libelle}
                    </Badge>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="mt-8 space-y-5 lg:sticky lg:top-20 lg:mt-0">
          <div className="rounded-2xl border border-border p-5">
            <p className="font-heading text-2xl font-bold tabular-nums">
              {formaterFcfa(Number(vehicule.prix))}
              {estLocation && (
                <span className="text-sm font-normal text-muted-foreground"> / jour</span>
              )}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {vehicule.negociable && <Badge variant="outline">Négociable</Badge>}
              <BadgeEcartPrix prix={vehicule.prix} prixSuggere={vehicule.prix_suggere} />
            </div>

            <button
              type="button"
              onClick={() => setEstFavori((v) => !v)}
              aria-pressed={estFavori}
              className={cn(buttonVariants({ variant: "outline" }), "effet-action mt-5 w-full")}
            >
              <Heart className={cn("size-4", estFavori && "fill-current text-primary")} />
              {estFavori ? "Dans vos favoris" : "Ajouter aux favoris"}
            </button>

            <Link href="/messages" className={cn(buttonVariants(), "effet-action mt-2 w-full")}>
              <MessageCircle className="size-4" />
              Contacter le vendeur
            </Link>

            <Link
              href="/client/rdv"
              className={cn(buttonVariants({ variant: "outline" }), "effet-action mt-2 w-full")}
            >
              <CalendarClock className="size-4" />
              Prendre rendez-vous
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function SkeletonFiche() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <Skeleton className="h-5 w-40" />
      <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
        <div>
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="mt-8 h-9 w-2/3" />
          <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="mt-8 h-72 w-full rounded-2xl lg:mt-0" />
      </div>
    </main>
  );
}

function FicheIntrouvable() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <section className="rounded-2xl border border-border p-12 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Car className="size-7" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-bold">Ce véhicule est introuvable</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          L&apos;annonce a peut-être été retirée, vendue, ou l&apos;adresse est incorrecte.
        </p>
        <Link
          href="/vehicules"
          className={cn(buttonVariants({ size: "lg" }), "effet-action mt-8")}
        >
          Retour au catalogue
        </Link>
      </section>
    </main>
  );
}
