"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, Heart, Search, TriangleAlert } from "lucide-react";

import BoutonRecharger from "@/components/BoutonRecharger";
import CarteFavori from "@/components/CarteFavori";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { estDisponible } from "@/lib/vehicule";
import type { Favori } from "@/types";

/**
 * Réponse de `GET /api/favoris`, champ `data`. Le back ne filtre RIEN : un favori
 * vendu ou réservé reste dans la liste, et c'est tout l'intérêt de cette page.
 */
const MOCK_FAVORIS: Favori[] = [
  {
    id: "f1000000-0000-4000-8000-000000000001",
    user_id: "b1e7c3d2-5a49-4f18-9c26-3d8b1a0e7f54",
    vehicule_id: "2c1d0e9f-8a7b-4c6d-9e5f-4a3b2c1d0e9f",
    date_ajout: "2026-08-11T08:20:00.000000Z",
    created_at: "2026-08-11T08:20:00.000000Z",
    vehicule: {
      id: "2c1d0e9f-8a7b-4c6d-9e5f-4a3b2c1d0e9f",
      created_by: "3f8a1b2c-9d7e-4f60-a531-8c4e6b2a9f03",
      post_type: "vente",
      type: "occasion",
      statut: "disponible",
      // cast decimal:2 : Laravel renvoie bien les deux décimales
      prix: "6250000.00",
      prix_suggere: "6800000.00",
      negociable: true,
      date_disponibilite: null,
      status_validation: "validee",
      views_count: 1842,
      created_at: "2026-07-28T11:00:00.000000Z",
      description: {
        marque: "Toyota",
        modele: "RAV4",
        annee: 2021,
        kilometrage: 48_500,
        carburant: "Essence",
        transmission: "Automatique",
        carrosserie: "SUV",
      },
      photos: [
        {
          id: "dd44ee55-ff66-4a77-8b88-cc99dd00ee11",
          path: "/toyota.jpeg",
          is_primary: true,
          position: 1,
        },
      ],
    },
  },
  {
    id: "f1000000-0000-4000-8000-000000000002",
    user_id: "b1e7c3d2-5a49-4f18-9c26-3d8b1a0e7f54",
    vehicule_id: "7f1e9c3a-4b28-4d51-8e60-9a2b3c4d5e6f",
    date_ajout: "2026-07-30T15:05:00.000000Z",
    created_at: "2026-07-30T15:05:00.000000Z",
    vehicule: {
      id: "7f1e9c3a-4b28-4d51-8e60-9a2b3c4d5e6f",
      created_by: "3f8a1b2c-9d7e-4f60-a531-8c4e6b2a9f03",
      post_type: "vente",
      type: "occasion",
      // parti pris de la page : ce favori est perdu, il reste affiché quand même
      statut: "vendu",
      prix: "4800000.00",
      prix_suggere: "4750000.00",
      negociable: false,
      date_disponibilite: null,
      status_validation: "validee",
      views_count: 1533,
      created_at: "2026-06-02T09:40:00.000000Z",
      description: {
        marque: "Hyundai",
        modele: "Tucson",
        annee: 2020,
        kilometrage: 72_300,
        carburant: "Diesel",
        transmission: "Automatique",
        carrosserie: "SUV",
      },
      photos: [
        {
          id: "aa11bb22-cc33-4d44-8e55-ff66aa77bb88",
          path: "/hyundai.jpeg",
          is_primary: true,
          position: 1,
        },
      ],
    },
  },
  {
    id: "f1000000-0000-4000-8000-000000000003",
    user_id: "b1e7c3d2-5a49-4f18-9c26-3d8b1a0e7f54",
    vehicule_id: "5d4c3b2a-1f0e-4998-8776-655443322110",
    date_ajout: "2026-08-13T19:45:00.000000Z",
    created_at: "2026-08-13T19:45:00.000000Z",
    vehicule: {
      id: "5d4c3b2a-1f0e-4998-8776-655443322110",
      created_by: "9d4e2f1a-6c3b-4a71-8e15-2b7f0c9d4e11",
      post_type: "location",
      type: "occasion",
      statut: "disponible",
      prix: "45000.00",
      // aucune estimation : Gemini n'a rien produit, le badge d'écart ne sort pas
      prix_suggere: null,
      negociable: false,
      date_disponibilite: "2026-08-20",
      status_validation: "validee",
      views_count: 1204,
      created_at: "2026-08-01T07:15:00.000000Z",
      description: {
        marque: "Kia",
        modele: "Sportage",
        annee: 2022,
        kilometrage: 21_000,
        carburant: "Essence",
        transmission: "Manuelle",
        carrosserie: "SUV",
      },
      photos: [
        {
          id: "bb22cc33-dd44-4e55-9f66-aa77bb88cc99",
          path: "/kia.jpeg",
          is_primary: true,
          position: 1,
        },
      ],
    },
  },
  {
    id: "f1000000-0000-4000-8000-000000000004",
    user_id: "b1e7c3d2-5a49-4f18-9c26-3d8b1a0e7f54",
    vehicule_id: "0e9f8a7b-6c5d-4e3f-8a1b-2c3d4e5f6a7b",
    date_ajout: "2026-06-19T12:00:00.000000Z",
    created_at: "2026-06-19T12:00:00.000000Z",
    vehicule: {
      id: "0e9f8a7b-6c5d-4e3f-8a1b-2c3d4e5f6a7b",
      created_by: "3f8a1b2c-9d7e-4f60-a531-8c4e6b2a9f03",
      post_type: "vente",
      type: "occasion",
      statut: "réservé",
      prix: "3100000.00",
      // demandé AU-DESSUS de l'estimation : le badge sort en gris, pas en menthe
      prix_suggere: "2870000.00",
      negociable: true,
      date_disponibilite: null,
      status_validation: "validee",
      views_count: 968,
      created_at: "2026-05-11T14:25:00.000000Z",
      description: {
        marque: "Nissan",
        modele: "Rogue",
        annee: 2019,
        kilometrage: 96_400,
        carburant: "Essence",
        transmission: "Automatique",
        carrosserie: "SUV",
      },
      photos: [
        {
          id: "cc33dd44-ee55-4f66-8a77-bb88cc99dd00",
          path: "/nissan.jpeg",
          is_primary: true,
          position: 1,
        },
      ],
    },
  },
  {
    id: "f1000000-0000-4000-8000-000000000005",
    user_id: "b1e7c3d2-5a49-4f18-9c26-3d8b1a0e7f54",
    vehicule_id: "4a3b2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d",
    date_ajout: "2026-08-06T10:10:00.000000Z",
    created_at: "2026-08-06T10:10:00.000000Z",
    vehicule: {
      id: "4a3b2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d",
      created_by: "9d4e2f1a-6c3b-4a71-8e15-2b7f0c9d4e11",
      post_type: "vente",
      type: "neuf",
      statut: "en_transaction",
      prix: "12400000.00",
      prix_suggere: "12500000.00",
      negociable: false,
      date_disponibilite: null,
      status_validation: "validee",
      views_count: 742,
      created_at: "2026-07-19T16:00:00.000000Z",
      // description ET photos absentes : les deux replis sont exercés d'un coup
      description: null,
      photos: [],
    },
  },
];

/** Même contrat que GET /api/favoris : seul ce corps changera au branchement. */
function recupererFavoris(): Promise<Favori[]> {
  // 700 ms : sans délai, l'état de chargement n'est jamais observable
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_FAVORIS), 700));
}

/** Même contrat que DELETE /api/favoris/{vehiculeId}. Rejette pour déclencher le retour en arrière. */
function retirerFavori(vehiculeId: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 400));
}

type Filtre = "tout" | "disponibles" | "indisponibles";

const LIBELLES_FILTRE: Record<Filtre, string> = {
  tout: "Tous",
  disponibles: "Encore disponibles",
  indisponibles: "Plus disponibles",
};

export default function PageFavoris() {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [erreur, setErreur] = useState<string | null>(null);
  // incrémenté par le bouton Recharger : c'est ce qui redéclenche le useEffect ci-dessous
  const [tentative, setTentative] = useState(0);

  useEffect(() => {
    // `annule` évite un setState sur un composant démonté si la réponse arrive trop tard
    let annule = false;

    recupererFavoris().then((liste) => {
      if (annule) return;
      setFavoris(liste);
      setChargement(false);
    });

    return () => {
      annule = true;
    };
  }, [tentative]);

  const recharger = () => {
    setChargement(true);
    setTentative((t) => t + 1);
  };

  // useMemo : ces trois partitions se recalculeraient à chaque frappe sans lui
  const { disponibles, indisponibles } = useMemo(
    () => ({
      disponibles: favoris.filter((f) => estDisponible(f.vehicule.statut)),
      indisponibles: favoris.filter((f) => !estDisponible(f.vehicule.statut)),
    }),
    [favoris]
  );

  const COMPTEURS: Record<Filtre, number> = {
    tout: favoris.length,
    disponibles: disponibles.length,
    indisponibles: indisponibles.length,
  };

  const listeAffichee =
    filtre === "disponibles"
      ? disponibles
      : filtre === "indisponibles"
        ? indisponibles
        : favoris;

  /**
   * Retrait optimiste : la carte disparaît AVANT la réponse du serveur, sinon
   * l'interface paraît figée pendant l'aller-retour. `precedents` conserve la
   * liste d'origine pour la remettre en place si l'appel échoue.
   */
  const retirer = (vehiculeId: string) => {
    const precedents = favoris;

    setErreur(null);
    setFavoris((liste) => liste.filter((f) => f.vehicule.id !== vehiculeId));

    retirerFavori(vehiculeId).catch(() => {
      setFavoris(precedents);
      setErreur("Le retrait a échoué. Le favori a été remis dans la liste.");
    });
  };

  if (chargement) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-5 w-96" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-96 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (favoris.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
        <section className="rounded-2xl border border-border p-12 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="size-7" />
          </span>
          <h1 className="mt-6 font-heading text-2xl font-bold">
            Aucun favori pour l&apos;instant
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Le cœur sur une annonce la met de côté ici. Vous y retrouvez son prix,
            et surtout vous êtes prévenu quand elle n&apos;est plus disponible.
          </p>
          <Link
            href="/vehicules"
            className={cn(buttonVariants({ size: "lg" }), "effet-action mt-8")}
          >
            <Search className="size-4" />
            Parcourir les véhicules
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">
            Mes favoris
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {favoris.length} véhicule{favoris.length > 1 ? "s" : ""} mis de côté.
            Les annonces vendues ou réservées restent affichées : c&apos;est ainsi
            que vous voyez le marché bouger.
          </p>
        </div>
        <BoutonRecharger onClick={recharger} chargement={chargement} className="mt-1" />
      </header>

      {/* l'information la plus utile de la page passe avant la grille */}
      {indisponibles.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-primary bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3 text-sm">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <strong className="font-semibold">
                {indisponibles.length} de vos favoris
              </strong>{" "}
              ne {indisponibles.length > 1 ? "sont" : "est"} plus disponible
              {indisponibles.length > 1 ? "s" : ""}. Créez une alerte pour être
              prévenu dès qu&apos;un modèle équivalent est publié.
            </span>
          </p>

          <Link
            href="/client/alertes"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "effet-action shrink-0 bg-background"
            )}
          >
            <BellRing className="size-4" />
            Créer une alerte
          </Link>
        </div>
      )}

      {/* role="status" : le lecteur d'écran annonce l'échec sans que le focus bouge */}
      {erreur && (
        <p
          role="status"
          className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {erreur}
        </p>
      )}

      <div role="tablist" className="mt-8 flex flex-wrap gap-2">
        {(["tout", "disponibles", "indisponibles"] as const).map((valeur) => (
          <button
            key={valeur}
            type="button"
            role="tab"
            aria-selected={valeur === filtre}
            onClick={() => setFiltre(valeur)}
            className={cn(
              "inline-flex items-center gap-2 rounded-4xl px-4 py-2 text-sm font-semibold transition-colors",
              valeur === filtre
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-foreground"
            )}
          >
            {LIBELLES_FILTRE[valeur]}
            <span className="tabular-nums opacity-70">{COMPTEURS[valeur]}</span>
          </button>
        ))}
      </div>

      {/* un filtre peut ne rien laisser : sans ce cas, la grille disparaît sans explication */}
      {listeAffichee.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">
          Aucun favori dans cette catégorie.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listeAffichee.map((favori, index) => (
            <CarteFavori
              key={favori.id}
              favori={favori}
              onRetirer={retirer}
              // 60 ms d'écart : la grille se remplit en cascade au lieu d'apparaître d'un bloc
              delai={index * 60}
            />
          ))}
        </div>
      )}
    </main>
  );
}
