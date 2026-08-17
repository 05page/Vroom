"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ban,
  Car,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import BoutonRecharger from "@/components/BoutonRecharger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn, formaterDateCourte, formaterFcfa, urlPhoto } from "@/lib/utils";
import {
  libelleVehicule,
  photoPrincipale,
  STYLE_STATUT,
  STYLE_VALIDATION,
} from "@/lib/vehicule";
import type { StatutValidation, StatutVehicule, VehiculeCatalogue } from "@/types";

/* ────────────────────────────────────────────────────────────────────────────
   PARC AUTO — /admin/parc-auto
   Miroir de AdminController::vehicules() (vroom-backend, routes/api.php:239) :
   la route back renvoie TOUS les véhicules, tous créateurs confondus. Cette
   page les filtre côté client sur `creator.role === "concessionnaire"` — le
   parc des concessionnaires, pas celui des vendeurs particuliers ni des
   auto-écoles. Aucun endpoint dédié n'existe : c'est au front de trier.
   ──────────────────────────────────────────────────────────────────────────── */

const IVOIRE = {
  id: "9d4e2f1a-6c3b-4a71-8e15-2b7f0c9d4e11",
  fullname: "Ivoire Auto Motors",
  role: "concessionnaire" as const,
};
const ABIDJAN_MOTORS = {
  id: "1a2b3c4d-5e6f-4708-9a1b-2c3d4e5f6071",
  fullname: "Abidjan Prestige Motors",
  role: "concessionnaire" as const,
};
const KOFFI = {
  id: "3f8a1b2c-9d7e-4f60-a531-8c4e6b2a9f03",
  fullname: "Koffi Aristide",
  role: "vendeur" as const,
};
const AUTO_ECOLE_PLATEAU = {
  id: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f",
  fullname: "Auto-École du Plateau",
  role: "auto_ecole" as const,
};

/** Réduit le bruit du bloc de mocks. La vraie charge utile reste celle de `VehiculeCatalogue`. */
const vehiculeAdmin = (
  id: string,
  creator: typeof IVOIRE | typeof KOFFI | typeof AUTO_ECOLE_PLATEAU,
  marque: string,
  modele: string,
  annee: number,
  prix: number,
  statut: StatutVehicule,
  statusValidation: StatutValidation,
  vues: number,
  photo: string | null,
  cree: string
): VehiculeCatalogue => ({
  id,
  created_by: creator.id,
  post_type: "vente",
  type: "occasion",
  statut,
  prix: prix.toFixed(2),
  prix_suggere: null,
  negociable: false,
  date_disponibilite: null,
  status_validation: statusValidation,
  views_count: vues,
  created_at: cree,
  description: {
    marque,
    modele,
    annee,
    kilometrage: 32_000,
    carburant: "Essence",
    transmission: "Automatique",
    carrosserie: "SUV",
  },
  photos: photo ? [{ id: `photo-${id}`, path: photo, is_primary: true, position: 1 }] : [],
  creator,
});

/** Même contrat que GET /admin/vehicules : seul ce corps changera au branchement. */
const recupererVehiculesAdmin = (): Promise<VehiculeCatalogue[]> => {
  const MOCK: VehiculeCatalogue[] = [
    vehiculeAdmin("a1000000-0000-4000-8000-0000000000a1", IVOIRE, "Toyota", "Land Cruiser", 2024, 28_500_000, "disponible", "validee", 512, "/toyota.jpeg", "2026-08-01T09:00:00Z"),
    vehiculeAdmin("a1000000-0000-4000-8000-0000000000a2", IVOIRE, "Hyundai", "Tucson", 2025, 14_200_000, "disponible", "en_attente", 8, "/hyundai.jpeg", "2026-08-15T11:30:00Z"),
    vehiculeAdmin("a1000000-0000-4000-8000-0000000000a3", ABIDJAN_MOTORS, "Mercedes", "Classe G", 2024, 42_000_000, "a_venir", "en_attente", 3, "/merco.jpeg", "2026-08-16T08:10:00Z"),
    vehiculeAdmin("a1000000-0000-4000-8000-0000000000a4", ABIDJAN_MOTORS, "Kia", "Sportage", 2023, 11_800_000, "vendu", "validee", 340, "/kia.jpeg", "2026-06-20T14:00:00Z"),
    vehiculeAdmin("a1000000-0000-4000-8000-0000000000a5", IVOIRE, "Nissan", "Patrol", 2022, 19_500_000, "suspendu", "suspendu", 96, null, "2026-05-11T10:00:00Z"),
    vehiculeAdmin("a1000000-0000-4000-8000-0000000000a6", ABIDJAN_MOTORS, "Toyota", "Hilux", 2021, 13_400_000, "disponible", "rejetee", 4, "/toyota.jpeg", "2026-07-02T16:45:00Z"),
    // deux annonces hors périmètre (vendeur, auto-école) : prouvent que le filtre fonctionne
    vehiculeAdmin("a1000000-0000-4000-8000-0000000000a7", KOFFI, "Toyota", "RAV4", 2021, 6_250_000, "disponible", "validee", 1842, "/toyota.jpeg", "2026-07-28T11:00:00Z"),
    vehiculeAdmin("a1000000-0000-4000-8000-0000000000a8", AUTO_ECOLE_PLATEAU, "Kia", "Picanto", 2020, 25_000, "disponible", "validee", 210, "/kia.jpeg", "2026-08-01T07:15:00Z"),
  ];

  // 700 ms : sans délai, l'état de chargement n'est jamais observable
  return new Promise((resolve) => setTimeout(() => resolve(MOCK), 700));
};

/** Même contrat que POST /admin/vehicules/{id}/valider. */
const validerVehiculeAdmin = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 500));

/** Même contrat que POST /admin/vehicules/{id}/rejeter, corps `{ details }`. */
const rejeterVehiculeAdmin = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 500));

/** Même contrat que POST /admin/vehicules/{id}/suspendre. */
const suspendreVehiculeAdmin = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 500));

/** Même contrat que DELETE /admin/vehicules/{id}. */
const supprimerVehiculeAdmin = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 500));

/** L'input `<select>` natif n'a pas de valeur "tout" possible : on la porte au niveau du filtre. */
const OPTIONS_STATUT: { valeur: StatutVehicule | "tout"; libelle: string }[] = [
  { valeur: "tout", libelle: "Tous les statuts" },
  { valeur: "disponible", libelle: "Disponible" },
  { valeur: "a_venir", libelle: "À venir" },
  { valeur: "réservé", libelle: "Réservé" },
  { valeur: "vendu", libelle: "Vendu" },
  { valeur: "loué", libelle: "Loué" },
  { valeur: "suspendu", libelle: "Suspendu" },
  { valeur: "banni", libelle: "Banni" },
  { valeur: "en_transaction", libelle: "En transaction" },
];

const OPTIONS_VALIDATION: { valeur: StatutValidation | "tout"; libelle: string }[] = [
  { valeur: "tout", libelle: "Toute validation" },
  { valeur: "en_attente", libelle: "En attente" },
  { valeur: "validee", libelle: "Validé" },
  { valeur: "rejetee", libelle: "Rejeté" },
  { valeur: "suspendu", libelle: "Suspendu" },
  { valeur: "restauree", libelle: "Restauré" },
];

type DialogueRejet = { vehicule: VehiculeCatalogue };
type DialogueConfirmation = { action: "suspendre" | "supprimer"; vehicule: VehiculeCatalogue };

export default function PageParcAuto() {
  const [vehicules, setVehicules] = useState<VehiculeCatalogue[]>([]);
  const [chargement, setChargement] = useState(true);
  // incrémenté par le bouton Recharger : c'est ce qui redéclenche le useEffect ci-dessous
  const [tentative, setTentative] = useState(0);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<StatutVehicule | "tout">("tout");
  const [filtreValidation, setFiltreValidation] = useState<StatutValidation | "tout">("tout");
  const [idEnCours, setIdEnCours] = useState<string | null>(null);
  const [dialogueRejet, setDialogueRejet] = useState<DialogueRejet | null>(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [dialogueConfirmation, setDialogueConfirmation] = useState<DialogueConfirmation | null>(null);

  useEffect(() => {
    // `annule` évite un setState sur un composant démonté si la réponse arrive trop tard
    let annule = false;

    recupererVehiculesAdmin().then((liste) => {
      if (annule) return;
      setVehicules(liste);
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

  // le parc des concessionnaires uniquement — pas les vendeurs particuliers, pas les auto-écoles
  const parcConcessionnaires = useMemo(
    () => vehicules.filter((v) => v.creator.role === "concessionnaire"),
    [vehicules]
  );

  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase();

    return parcConcessionnaires.filter((v) => {
      if (filtreStatut !== "tout" && v.statut !== filtreStatut) return false;
      if (filtreValidation !== "tout" && v.status_validation !== filtreValidation) return false;

      if (q) {
        const cible =
          `${v.description?.marque ?? ""} ${v.description?.modele ?? ""} ${v.creator.fullname}`.toLowerCase();
        if (!cible.includes(q)) return false;
      }

      return true;
    });
  }, [parcConcessionnaires, filtreStatut, filtreValidation, recherche]);

  const executerAction = async (id: string, action: () => Promise<void>, appliquer: (v: VehiculeCatalogue) => VehiculeCatalogue) => {
    setIdEnCours(id);
    try {
      await action();
      setVehicules((liste) => liste.map((v) => (v.id === id ? appliquer(v) : v)));
    } finally {
      setIdEnCours(null);
    }
  };

  const valider = (v: VehiculeCatalogue) =>
    executerAction(v.id, validerVehiculeAdmin, (item) => ({ ...item, status_validation: "validee" }));

  const confirmerRejet = async () => {
    if (!dialogueRejet) return;
    const id = dialogueRejet.vehicule.id;
    setIdEnCours(id);
    try {
      await rejeterVehiculeAdmin();
      setVehicules((liste) =>
        liste.map((v) => (v.id === id ? { ...v, status_validation: "rejetee" } : v))
      );
      setDialogueRejet(null);
      setMotifRejet("");
    } finally {
      setIdEnCours(null);
    }
  };

  const confirmerAction = async () => {
    if (!dialogueConfirmation) return;
    const { action, vehicule } = dialogueConfirmation;
    setIdEnCours(vehicule.id);
    try {
      if (action === "suspendre") {
        await suspendreVehiculeAdmin();
        setVehicules((liste) =>
          liste.map((v) => (v.id === vehicule.id ? { ...v, statut: "suspendu" } : v))
        );
      } else {
        await supprimerVehiculeAdmin();
        setVehicules((liste) => liste.filter((v) => v.id !== vehicule.id));
      }
      setDialogueConfirmation(null);
    } finally {
      setIdEnCours(null);
    }
  };

  if (chargement) {
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-8 h-12 w-full" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">Parc auto</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {parcConcessionnaires.length} annonce{parcConcessionnaires.length > 1 ? "s" : ""} publiée
            {parcConcessionnaires.length > 1 ? "s" : ""} par des concessionnaires, sur{" "}
            {vehicules.length} au total tous vendeurs confondus.
          </p>
        </div>
        <BoutonRecharger onClick={recharger} chargement={chargement} className="mt-1" />
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Marque, modèle, concessionnaire…"
            className="pl-9"
          />
        </div>

        <Select value={filtreStatut} onValueChange={(v) => v && setFiltreStatut(v as StatutVehicule | "tout")}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS_STATUT.map((o) => (
              <SelectItem key={o.valeur} value={o.valeur}>
                {o.libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtreValidation}
          onValueChange={(v) => v && setFiltreValidation(v as StatutValidation | "tout")}
        >
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS_VALIDATION.map((o) => (
              <SelectItem key={o.valeur} value={o.valeur}>
                {o.libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {resultats.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border p-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Car className="size-6" />
          </span>
          <h2 className="mt-5 font-heading text-xl font-bold">Aucun véhicule ne correspond</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Élargissez la recherche ou réinitialisez les filtres.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead>Concessionnaire</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead className="text-right">Vues</TableHead>
                <TableHead>Publié le</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultats.map((v) => {
                const libelle = libelleVehicule(v.description, v.id);
                const photo = photoPrincipale(v.photos);
                const enCours = idEnCours === v.id;

                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {photo ? (
                            // <img> et non <Image> : les photos viennent du backend, absent des remotePatterns
                            <img src={urlPhoto(photo.path)} alt="" className="size-full object-cover" />
                          ) : (
                            <span className="flex size-full items-center justify-center text-muted-foreground">
                              <Car className="size-4" />
                            </span>
                          )}
                        </span>
                        <Link
                          href={`/vehicules/${v.id}`}
                          target="_blank"
                          className="truncate text-sm font-semibold hover:text-primary"
                        >
                          {libelle}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.creator.fullname}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">
                      {formaterFcfa(Number(v.prix))}
                    </TableCell>
                    <TableCell>
                      <Badge className={STYLE_STATUT[v.statut].classes}>{STYLE_STATUT[v.statut].libelle}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STYLE_VALIDATION[v.status_validation].classes}>
                        {STYLE_VALIDATION[v.status_validation].libelle}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {v.views_count.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formaterDateCourte(v.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={enCours}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                          aria-label={`Actions pour ${libelle}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            render={<Link href={`/vehicules/${v.id}`} target="_blank" />}
                          >
                            <ExternalLink className="size-4" />
                            Voir la fiche publique
                          </DropdownMenuItem>

                          {v.status_validation === "en_attente" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => valider(v)}>
                                <CheckCircle2 className="size-4" />
                                Valider
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogueRejet({ vehicule: v });
                                  setMotifRejet("");
                                }}
                              >
                                <XCircle className="size-4" />
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          )}

                          {v.statut !== "suspendu" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDialogueConfirmation({ action: "suspendre", vehicule: v })}
                              >
                                <Ban className="size-4" />
                                Suspendre
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDialogueConfirmation({ action: "supprimer", vehicule: v })}
                          >
                            <Trash2 className="size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Rejet : le back exige un motif (`details`, requis, 500 caractères max) */}
      <Dialog
        open={dialogueRejet !== null}
        onOpenChange={(ouvert) => !ouvert && setDialogueRejet(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter cette annonce</DialogTitle>
            <DialogDescription>
              {dialogueRejet && libelleVehicule(dialogueRejet.vehicule.description, dialogueRejet.vehicule.id)}
              {" — le motif est transmis au concessionnaire."}
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="motif-rejet">Motif</Label>
            <Textarea
              id="motif-rejet"
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              maxLength={500}
              placeholder="Photos non conformes, kilométrage incohérent…"
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setDialogueRejet(null)}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={motifRejet.trim().length === 0 || idEnCours !== null}
              onClick={confirmerRejet}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              {idEnCours ? "Rejet…" : "Rejeter"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspendre / Supprimer : simple confirmation, pas de champ à saisir */}
      <AlertDialog
        open={dialogueConfirmation !== null}
        onOpenChange={(ouvert) => !ouvert && setDialogueConfirmation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogueConfirmation?.action === "supprimer" ? "Supprimer cette annonce ?" : "Suspendre cette annonce ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogueConfirmation &&
                libelleVehicule(
                  dialogueConfirmation.vehicule.description,
                  dialogueConfirmation.vehicule.id
                )}
              {dialogueConfirmation?.action === "supprimer"
                ? " — l'annonce quitte le parc auto. Cette action reste réversible depuis la corbeille."
                : " — l'annonce reste en ligne mais n'apparaît plus dans le catalogue public."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant={dialogueConfirmation?.action === "supprimer" ? "destructive" : "default"}
              disabled={idEnCours !== null}
              onClick={confirmerAction}
            >
              {dialogueConfirmation?.action === "supprimer" ? "Supprimer" : "Suspendre"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
