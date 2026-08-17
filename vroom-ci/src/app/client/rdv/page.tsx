"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, History, Search } from "lucide-react";

import BoutonRecharger from "@/components/BoutonRecharger";
import LigneRdv from "@/components/LigneRdv";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { estAVenir } from "@/lib/rdv";
import type {
  RendezVousClient,
  UtilisateurResume,
  VehiculeTransaction,
} from "@/types";

/* ─── Données simulées ─────────────────────────────────────────────────────── */

const VENDEURS: Record<string, UtilisateurResume> = {
  koffi: {
    id: "3f8a1b2c-9d7e-4f60-a531-8c4e6b2a9f03",
    fullname: "Koffi Aristide",
    avatar: null,
  },
  ivoire: {
    id: "9d4e2f1a-6c3b-4a71-8e15-2b7f0c9d4e11",
    fullname: "Ivoire Auto Motors",
    avatar: null,
  },
  bakary: {
    id: "6e5f4a3b-2c1d-4e9f-8a7b-6c5d4e3f2a1b",
    fullname: "Bakary Traoré",
    avatar: null,
  },
};

/** Réduit le bruit du bloc de mocks. La vraie charge utile reste celle de `VehiculeTransaction`. */
function vehiculeRdv(
  id: string,
  marque: string,
  modele: string,
  annee: number,
  photo: string | null,
  prix: string
): VehiculeTransaction {
  return {
    id,
    post_type: "vente",
    statut: "disponible",
    prix,
    description: photo === null ? null : { marque, modele, annee },
    photos: photo
      ? [{ id: `photo-${id}`, path: photo, is_primary: true, position: 1 }]
      : [],
  };
}

const CLIENT_ID = "b1e7c3d2-5a49-4f18-9c26-3d8b1a0e7f54";

/**
 * Réponse de `GET /api/rdv/mes-rdv`, champ `data`. Volontairement dans l'ordre
 * du back — `date_heure` DESC, à venir et passés mêlés — pour que la
 * re-partition de la page soit réellement exercée.
 */
const MOCK_RDV: RendezVousClient[] = [
  {
    id: "a1000000-0000-4000-8000-000000000002",
    client_id: CLIENT_ID,
    vendeur_id: VENDEURS.ivoire.id,
    vehicule_id: "7f1e9c3a-4b28-4d51-8e60-9a2b3c4d5e6f",
    date_heure: "2026-08-21T10:00:00.000000Z",
    type: "visite",
    statut: "en_attente",
    motif: null,
    // nullable en base : la carte doit afficher un repli, pas "null"
    lieu: null,
    notes: null,
    created_at: "2026-08-12T09:00:00.000000Z",
    vendeur: VENDEURS.ivoire,
    vehicule: vehiculeRdv(
      "7f1e9c3a-4b28-4d51-8e60-9a2b3c4d5e6f",
      "Hyundai", "Tucson", 2020, "/hyundai.jpeg", "4800000.00"
    ),
    has_avis: false,
  },
  {
    id: "a1000000-0000-4000-8000-000000000001",
    client_id: CLIENT_ID,
    vendeur_id: VENDEURS.koffi.id,
    vehicule_id: "2c1d0e9f-8a7b-4c6d-9e5f-4a3b2c1d0e9f",
    date_heure: "2026-08-16T14:30:00.000000Z",
    type: "essai_routier",
    statut: "confirmé",
    motif: null,
    lieu: "Cocody, station Shell Riviera 2",
    notes: null,
    created_at: "2026-08-10T18:20:00.000000Z",
    vendeur: VENDEURS.koffi,
    vehicule: vehiculeRdv(
      "2c1d0e9f-8a7b-4c6d-9e5f-4a3b2c1d0e9f",
      "Toyota", "RAV4", 2021, "/toyota.jpeg", "6250000.00"
    ),
    has_avis: false,
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    client_id: CLIENT_ID,
    vendeur_id: VENDEURS.ivoire.id,
    vehicule_id: "5d4c3b2a-1f0e-4998-8776-655443322110",
    date_heure: "2026-07-20T16:00:00.000000Z",
    type: "premiere_rencontre",
    statut: "terminé",
    motif: null,
    lieu: "Marcory Zone 4, siège Ivoire Auto",
    notes: null,
    created_at: "2026-07-15T11:30:00.000000Z",
    vendeur: VENDEURS.ivoire,
    vehicule: vehiculeRdv(
      "5d4c3b2a-1f0e-4998-8776-655443322110",
      "Kia", "Sportage", 2022, "/kia.jpeg", "45000.00"
    ),
    // seul RDV notable : terminé et pas encore d'avis pour ce vendeur
    has_avis: false,
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    client_id: CLIENT_ID,
    vendeur_id: VENDEURS.bakary.id,
    vehicule_id: "0e9f8a7b-6c5d-4e3f-8a1b-2c3d4e5f6a7b",
    date_heure: "2026-06-10T09:30:00.000000Z",
    type: "essai_routier",
    statut: "terminé",
    motif: null,
    lieu: "Yopougon, carrefour Siporex",
    notes: null,
    created_at: "2026-06-05T14:00:00.000000Z",
    vendeur: VENDEURS.bakary,
    vehicule: vehiculeRdv(
      "0e9f8a7b-6c5d-4e3f-8a1b-2c3d4e5f6a7b",
      "Nissan", "Rogue", 2019, "/nissan.jpeg", "3100000.00"
    ),
    has_avis: true,
  },
  {
    id: "a1000000-0000-4000-8000-000000000005",
    client_id: CLIENT_ID,
    vendeur_id: VENDEURS.koffi.id,
    vehicule_id: "9e8d7c6b-5a49-4382-9170-6f5e4d3c2b1a",
    date_heure: "2026-05-28T11:00:00.000000Z",
    type: "visite",
    statut: "annulé",
    motif: "Le véhicule a été vendu avant notre rencontre.",
    lieu: "Plateau, avenue Chardy",
    notes: null,
    created_at: "2026-05-20T08:45:00.000000Z",
    vendeur: VENDEURS.koffi,
    vehicule: vehiculeRdv(
      "9e8d7c6b-5a49-4382-9170-6f5e4d3c2b1a",
      "Mercedes", "Classe C", 2018, "/merco.jpeg", "5500000.00"
    ),
    has_avis: false,
  },
  {
    id: "a1000000-0000-4000-8000-000000000006",
    client_id: CLIENT_ID,
    vendeur_id: VENDEURS.bakary.id,
    vehicule_id: "4a3b2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d",
    date_heure: "2026-05-02T15:00:00.000000Z",
    type: "visite",
    statut: "refusé",
    motif: null,
    lieu: null,
    notes: null,
    created_at: "2026-04-28T10:10:00.000000Z",
    vendeur: VENDEURS.bakary,
    // ni description ni photo : les deux replis de la ligne sont exercés
    vehicule: vehiculeRdv(
      "4a3b2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d",
      "", "", 0, null, "12400000.00"
    ),
    has_avis: true,
  },
];

/** Même contrat que GET /api/rdv/mes-rdv : seul ce corps changera au branchement. */
function recupererRdv(): Promise<RendezVousClient[]> {
  // 700 ms : sans délai, l'état de chargement n'est jamais observable
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_RDV), 700));
}

/** Même contrat que POST /api/rdv/{id}/annuler, corps `{ motif? }`. */
function annulerRdv(id: string, motif: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

/** Même contrat que POST /api/avis, corps `{ rdv_id, note, commentaire? }`. */
function envoyerAvis(
  rdvId: string,
  note: number,
  commentaire: string
): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function PageRdv() {
  const [rdvs, setRdvs] = useState<RendezVousClient[]>([]);
  const [chargement, setChargement] = useState(true);
  // incrémenté par le bouton Recharger : c'est ce qui redéclenche le useEffect ci-dessous
  const [tentative, setTentative] = useState(0);

  useEffect(() => {
    // `annule` évite un setState sur un composant démonté si la réponse arrive trop tard
    let annule = false;

    recupererRdv().then((liste) => {
      if (annule) return;
      setRdvs(liste);
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

  /**
   * Le back trie tout en `date_heure` DESC, à venir et passés confondus. On
   * coupe le flux en deux et on INVERSE le tri des rendez-vous à venir : sur ce
   * qui est devant soi, c'est le plus proche qui compte, pas le plus lointain.
   * L'historique, lui, garde l'ordre décroissant — le plus récent en tête.
   */
  const { aVenir, passes } = useMemo(() => {
    const parDate = (a: RendezVousClient, b: RendezVousClient) =>
      new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime();

    return {
      aVenir: rdvs.filter(estAVenir).sort(parDate),
      passes: rdvs.filter((rdv) => !estAVenir(rdv)).sort((a, b) => parDate(b, a)),
    };
  }, [rdvs]);

  const traiterAnnulation = async (id: string, motif: string) => {
    await annulerRdv(id, motif);

    setRdvs((liste) =>
      liste.map((rdv) =>
        rdv.id === id
          ? { ...rdv, statut: "annulé" as const, motif: motif || null }
          : rdv
      )
    );
  };

  const traiterAvis = async (
    rdvId: string,
    note: number,
    commentaire: string
  ) => {
    await envoyerAvis(rdvId, note, commentaire);

    // `has_avis` se calcule sur le couple (client, VENDEUR) : noter une fois
    // éteint le bouton sur TOUS les rendez-vous passés avec ce même vendeur.
    const vendeurId = rdvs.find((rdv) => rdv.id === rdvId)?.vendeur_id;

    setRdvs((liste) =>
      liste.map((rdv) =>
        rdv.vendeur_id === vendeurId ? { ...rdv, has_avis: true } : rdv
      )
    );
  };

  if (chargement) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-4 h-5 w-96" />
        <div className="mt-10 space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-52 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (rdvs.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
        <section className="rounded-2xl border border-border p-12 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarCheck className="size-7" />
          </span>
          <h1 className="mt-6 font-heading text-2xl font-bold">
            Aucun rendez-vous
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Depuis la fiche d&apos;un véhicule, proposez un créneau au vendeur
            pour une visite ou un essai. Il confirme, et le rendez-vous apparaît
            ici.
          </p>
          <Link
            href="/vehicules"
            className={cn(buttonVariants({ size: "lg" }), "effet-action mt-8")}
          >
            <Search className="size-4" />
            Trouver un véhicule
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">
            Mes rendez-vous
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {aVenir.length > 0
              ? `${aVenir.length} rendez-vous à venir. La rencontre a lieu hors plateforme : aucun paiement ne transite par Move CI.`
              : "Aucun rendez-vous devant vous pour l'instant. Votre historique est plus bas."}
          </p>
        </div>
        <BoutonRecharger onClick={recharger} chargement={chargement} className="mt-1" />
      </header>

      {aVenir.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold">
            <CalendarCheck className="size-5 text-primary" />
            À venir
            <span className="text-base font-normal tabular-nums text-muted-foreground">
              {aVenir.length}
            </span>
          </h2>

          <ol className="mt-6">
            {aVenir.map((rdv, index) => (
              <LigneRdv
                key={rdv.id}
                rdv={rdv}
                dernier={index === aVenir.length - 1}
                // seul le premier de la liste ascendante porte l'or
                prochain={index === 0}
                delai={index * 70}
                onAnnuler={traiterAnnulation}
                onNoter={traiterAvis}
              />
            ))}
          </ol>
        </section>
      )}

      {passes.length > 0 && (
        <section className="mt-14">
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold">
            <History className="size-5 text-muted-foreground" />
            Historique
            <span className="text-base font-normal tabular-nums text-muted-foreground">
              {passes.length}
            </span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Après une rencontre terminée, votre avis aide les prochains acheteurs
            à choisir.
          </p>

          <ol className="mt-6">
            {passes.map((rdv, index) => (
              <LigneRdv
                key={rdv.id}
                rdv={rdv}
                dernier={index === passes.length - 1}
                delai={Math.min(index, 6) * 70}
                onAnnuler={traiterAnnulation}
                onNoter={traiterAvis}
              />
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
