"use client"
import BoutonRecharger from "@/components/BoutonRecharger";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, initiales, LIBELLES_ROLE } from "@/lib/utils";
import type { VehiculeVus, VendeurVedette } from "@/types";
import {
  Building2,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flag,
  GraduationCap,
  Handshake,
  ImagePlus,
  Mail,
  MapPin,
  MessageCircle,
  ScanSearch,
  Search,
  ShieldCheck,
  Star,
  UserCog,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
const heroSlides: HeroSlide[] = [
  {
    id: 1,
    cible: "Particuliers",
    titre: "Vendez votre véhicule sans intermédiaire",
    description:
      "Publiez votre annonce en 5 minutes et vendez sans intermédiaire.",
    // Une main tendue avec les clés d'une voiture : la vente conclue.
    image: "/vendeur.jpg",
    // visage à ~42% de la largeur, clé à ~62% : on centre entre les deux
    position: "52% center",
    href: "/vendeur/vehicules/nouveau",
    libelleAction: "Déposer une annonce",
  },
  {
    id: 2,
    cible: "Concessionnaires",
    titre: "Gérez tout votre stock en ligne",
    description:
      "Exposez tout votre stock et suivez vos ventes depuis un seul tableau de bord.",
    // Hall de concession rempli de véhicules exposés : le stock à gérer.
    image: "/concessionnaire.jpg",
    // le véhicule de tête occupe la moitié gauche : on décale pour garder calandre et roue
    position: "42% center",
    href: "/partenaire",
    libelleAction: "Devenir partenaire",
  },
  {
    id: 3,
    cible: "Auto-écoles",
    titre: "Remplissez vos sessions de formation",
    description:
      "Présentez vos formations au permis et remplissez vos sessions.",
    // Vue depuis l'arrière : élève au volant, accompagnateur à droite.
    image: "/auto-ecole.jpg",
    // photo en 2.29 : centrée on ne verrait que le pare-brise, on recentre sur le volant
    position: "32% center",
    href: "/auto-ecoles",
    libelleAction: "Référencer mon auto-école",
  },
  {
    id: 4,
    cible: "Acheteurs & vendeurs",
    titre: "Prenez rendez-vous en toute confiance",
    description:
      "Prenez rendez-vous et confirmez la transaction des deux côtés.",
    // Poignée de main entre deux personnes : l'accord conclu des deux côtés.
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&crop=entropy&w=2400&h=1050&q=80",
    href: "/vehicules",
    libelleAction: "Trouver un véhicule",
  },
];

// Les `href` pointent vers les ids UUID des mocks de /vehicules/page.tsx (et
// repris dans /client/favoris, /messages) — pas des entiers 1..9. Le jour où
// /vehicules/[id] cherchera par id réel, un lien qui pointe vers un id qui
// n'existe dans AUCUN mock retomberait toujours sur "introuvable".
const VehiculesPlusVus: VehiculeVus[] = [
  {
    id: 1,
    marque: "Nissan",
    modele: "Rogue",
    image: "/nissan.jpeg",
    href: "/vehicules/0e9f8a7b-6c5d-4e3f-8a1b-2c3d4e5f6a7b",
  },
  {
    id: 2,
    marque: "Hyundai",
    modele: "Tucson Hybrid",
    image: "/hyundai.jpeg",
    href: "/vehicules/7f1e9c3a-4b28-4d51-8e60-9a2b3c4d5e6f",
  },
  {
    id: 3,
    marque: "Toyota",
    modele: "Corolla",
    image: "/toyota.jpeg",
    href: "/vehicules/1b2c3d4e-5f60-4718-8a29-3b4c5d6e7f81",
  },

  {
    id: 4,
    marque: "Mercedes",
    modele: "Class G",
    image: "/merco.jpeg",
    href: "/vehicules/4a3b2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d",
  },

  {
    id: 5,
    marque: "Kia",
    modele: "Sportage",
    image: "/kia.jpeg",
    href: "/vehicules/5d4c3b2a-1f0e-4998-8776-655443322110",
  },
];

/** Résultat simulé de la géoloc : c'est la commune qui distingue ce rail du principal, pas le modèle. */
const MOCK_PROCHES: VehiculeVus[] = [
  { id: 6, marque: "Toyota", modele: "RAV4", image: "/toyota.jpeg", href: "/vehicules/2c1d0e9f-8a7b-4c6d-9e5f-4a3b2c1d0e9f", commune: "Cocody" },
  { id: 7, marque: "Hyundai", modele: "Tucson", image: "/hyundai.jpeg", href: "/vehicules/7f1e9c3a-4b28-4d51-8e60-9a2b3c4d5e6f", commune: "Marcory" },
  { id: 8, marque: "Nissan", modele: "Rogue", image: "/nissan.jpeg", href: "/vehicules/0e9f8a7b-6c5d-4e3f-8a1b-2c3d4e5f6a7b", commune: "Yopougon" },
  { id: 9, marque: "Kia", modele: "Sportage", image: "/kia.jpeg", href: "/vehicules/5d4c3b2a-1f0e-4998-8776-655443322110", commune: "Treichville" },
];

/**
 * Fausse API des véhicules proches. Signature IDENTIQUE à celle qu'aura le vrai
 * fetch vers GET /api/geo/proches : le jour du branchement, seul ce corps change.
 */
function recupererVehiculesProches(
  lat: number,
  lng: number
): Promise<VehiculeVus[]> {
  // les 700 ms rendent l'état "chargement" observable, sinon les Skeleton ne s'affichent jamais
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PROCHES), 700));
}

/** Option (a) de l'ÉTAPE 4 : mock aujourd'hui, GET /vendeurs/vedettes le jour où Laravel l'expose. */
const MOCK_VENDEURS: VendeurVedette[] = [
  {
    id: "9d4e2f1a-6c3b-4a71-8e15-2b7f0c9d4e11",
    fullname: "Ivoire Auto Motors",
    avatar: null,
    role: "concessionnaire",
    note_moyenne: 4.8,
    nb_avis: 37,
    nb_vehicules: 24,
  },
  {
    id: "3f8a1b2c-9d7e-4f60-a531-8c4e6b2a9f03",
    fullname: "Koffi Aristide",
    avatar: null,
    role: "vendeur",
    note_moyenne: 4.5,
    nb_avis: 12,
    nb_vehicules: 3,
  },
  {
    id: "7c2d5e9a-4b81-4c36-9f72-1a3e8d6b5c42",
    fullname: "Auto-école La Réussite",
    avatar: null,
    role: "auto_ecole",
    note_moyenne: 4.6,
    nb_avis: 21,
    nb_vehicules: 5,
  },
];

/** Même contrat que la future route publique : seul ce corps changera au branchement. */
function recupererVendeursVedettes(): Promise<VendeurVedette[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_VENDEURS), 700));
}

type EtapeParcours = {
  numero: number;
  titre: string;
  description: string;
  icone: LucideIcon;
};

type ProfilParcours = {
  /** Sert de clé React ET de valeur d'onglet actif : "acheteur". */
  id: "acheteur" | "vendeur" | "auto-ecole";
  /** Libellé de l'onglet, 2 mots max : "Je vends". */
  libelle: string;
  /** Exactement 4 étapes : le rail est en md:grid-cols-4. */
  etapes: EtapeParcours[];
  /** Destination du bouton de fin de parcours : "/vehicules". */
  href: string;
  libelleAction: string;
};

/** Parcours des 3 profils, repris de docs/CAHIER-DES-CHARGES.md § « Parcours utilisateurs critiques ». */
const PARCOURS: ProfilParcours[] = [
  {
    id: "acheteur",
    libelle: "J'achète",
    href: "/vehicules",
    libelleAction: "Trouver un véhicule",
    etapes: [
      {
        numero: 1,
        titre: "Créez votre compte",
        description:
          "Connexion avec Google en un clic. Aucun mot de passe à retenir, vous êtes acheteur par défaut.",
        icone: UserPlus,
      },
      {
        numero: 2,
        titre: "Trouvez votre véhicule",
        description:
          "Filtrez par marque, budget ou ville, gardez vos coups de cœur en favoris et créez une alerte si rien ne correspond.",
        icone: Search,
      },
      {
        numero: 3,
        titre: "Prenez rendez-vous",
        description:
          "Proposez un créneau au vendeur pour une visite ou un essai. Il confirme, vous êtes notifié en temps réel.",
        icone: CalendarCheck,
      },
      {
        numero: 4,
        titre: "Confirmez à deux",
        description:
          "La rencontre a lieu hors plateforme, aucun paiement ne transite par Move CI. La vente n'est actée que si vous confirmez tous les deux.",
        icone: ShieldCheck,
      },
    ],
  },

  {
    id: "vendeur",
    libelle: "Je vends",
    href: "/vendeur/vehicules/nouveau",
    libelleAction: "Déposer une annonce",
    etapes: [
      {
        numero: 1,
        titre: "Passez en vendeur",
        description:
          "Créez votre compte, puis basculez en profil vendeur ou concessionnaire. Le parcours est le même, le stock change d'échelle.",
        icone: UserCog,
      },
      {
        numero: 2,
        titre: "Publiez votre annonce",
        description:
          "Photos, marque, modèle, kilométrage et prix. Comptez 5 minutes, et n'oubliez pas la photo du tableau de bord.",
        icone: ImagePlus,
      },
      {
        numero: 3,
        titre: "L'IA vérifie tout",
        description:
          "Gemini recoupe vos photos avec le modèle déclaré et lit votre compteur à 500 km près. Si tout concorde, l'annonce part en ligne.",
        icone: ScanSearch,
      },
      {
        numero: 4,
        titre: "Recevez vos acheteurs",
        description:
          "Les demandes de rendez-vous arrivent, vous choisissez vos créneaux. La vente n'est actée qu'une fois confirmée des deux côtés.",
        icone: Handshake,
      },
    ],
  },
  {
    id: "auto-ecole",
    libelle: "Je forme",
    href: "/auto-ecoles",
    libelleAction: "Référencer mon auto-école",
    etapes: [
      {
        numero: 1,
        titre: "Créez votre compte",
        description:
          "Inscrivez-vous avec Google, puis demandez le profil auto-école pour accéder à votre espace de gestion.",
        icone: UserPlus,
      },
      {
        numero: 2,
        titre: "Décrivez votre établissement",
        description:
          "Adresse, numéro d'agrément, horaires et tarifs : votre fiche devient votre vitrine sur toute la Côte d'Ivoire.",
        icone: Building2,
      },
      {
        numero: 3,
        titre: "Publiez vos formations",
        description:
          "Permis A, B ou C, durée, prix et places disponibles. Chaque session publiée devient visible dans les recherches.",
        icone: GraduationCap,
      },
      {
        numero: 4,
        titre: "Remplissez vos sessions",
        description:
          "Les candidats demandent un rendez-vous d'inscription. Vous validez le créneau, ils sont notifiés aussitôt.",
        icone: CalendarCheck,
      },
    ],
  },
];

type ArgumentConfiance = {
  titre: string;
  description: string;
  icone: LucideIcon;
};

/** Les 4 garde-fous réellement implémentés côté back : Gemini, messagerie, double confirmation, signalement. */
const ARGUMENTS_CONFIANCE: ArgumentConfiance[] = [
  {
    titre: "Chaque annonce est vérifiée",
    description:
      "Notre IA recoupe les photos avec le modèle déclaré et lit le compteur avant la mise en ligne. Une annonce incohérente est rejetée.",
    icone: ScanSearch,
  },
  {
    titre: "Votre numéro reste privé",
    description:
      "Discutez avec le vendeur depuis la messagerie Move CI. Vous ne partagez vos coordonnées que si vous décidez de le faire.",
    icone: MessageCircle,
  },
  {
    titre: "La vente se confirme à deux",
    description:
      "Rien n'est acté tant que l'acheteur et le vendeur n'ont pas confirmé chacun de leur côté. Aucun paiement ne transite par la plateforme.",
    icone: ShieldCheck,
  },
  {
    titre: "Un doute, un signalement",
    description:
      "Signalez une annonce en deux clics. Elle est suspendue le temps que notre équipe vérifie, et vous êtes tenu au courant.",
    icone: Flag,
  },
];

type QuestionFrequente = {
  /** Sert aussi de clé React : deux questions identiques n'auraient aucun sens. */
  question: string;
  reponse: string;
};

const FAQ: QuestionFrequente[] = [
  {
    question: "Move CI prend-elle une commission sur mes ventes ?",
    reponse:
      "Non. Aucun paiement ne transite par la plateforme : vous réglez directement le vendeur, comme pour n'importe quelle vente entre particuliers.",
  },
  {
    question: "Comment savoir si une annonce est fiable ?",
    reponse:
      "Toute annonce visible a passé le contrôle automatique : photos comparées au modèle déclaré, kilométrage vérifié sur la photo du compteur. Vous consultez aussi les avis laissés sur le vendeur.",
  },
  {
    question: "Dois-je donner mon numéro de téléphone ?",
    reponse:
      "Non. La messagerie interne suffit pour poser vos questions et convenir d'un rendez-vous. Vos coordonnées ne sont jamais affichées sur l'annonce.",
  },
  {
    question: "Que se passe-t-il après le rendez-vous ?",
    reponse:
      "Chacun confirme la vente de son côté. Tant que les deux confirmations ne sont pas là, le véhicule reste disponible pour les autres acheteurs.",
  },
  {
    question: "Je suis concessionnaire, dois-je payer un abonnement ?",
    reponse:
      "Non, il n'y a pas d'abonnement sur Move CI. Vous publiez autant de véhicules que votre stock l'exige et vous les suivez depuis un tableau de bord unique.",
  },
  {
    question: "Je dirige une auto-école, comment référencer mes formations ?",
    reponse:
      "Créez votre compte, demandez le profil auto-école, puis publiez vos formations avec leurs tarifs et leurs places disponibles. Les candidats vous demandent un rendez-vous d'inscription.",
  },
];

/**
 * Carte véhicule photo + voile + texte superposé. Sert au rail « plus vus » ET
 * à la grille géolocalisée : `className` reçoit la largeur, qui seule diffère.
 */
function CarteVehicule({
  vehicule,
  className,
}: {
  vehicule: VehiculeVus;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative aspect-3/4 overflow-hidden rounded-2xl shadow-md",
        className
      )}
    >
      <Image
        fill
        src={vehicule.image}
        alt={`${vehicule.marque} ${vehicule.modele}`}
        sizes="(min-width: 640px) 704px, 640px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white">
        <p className="text-xs uppercase tracking-wider text-white/70">
          {vehicule.marque}
        </p>
        <h3 className="font-heading text-xl font-bold">{vehicule.modele}</h3>
        {/* absente du rail « plus vus » : le && n'affiche la ligne que si la donnée existe */}
        {vehicule.commune && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/70">
            <MapPin className="size-3" />
            {vehicule.commune}
          </p>
        )}
        <Link href={vehicule.href}>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 transition-all group-hover:text-white">
            Découvrir
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  const VehiculeScrollRef = useRef<HTMLDivElement>(null)
  const [profilActif, setProfilActif] = useState<ProfilParcours["id"]>("acheteur");
  // find() peut renvoyer undefined : le ?? garde `parcours` non-nullable pour TypeScript
  const parcours = PARCOURS.find((profil) => profil.id === profilActif) ?? PARCOURS[0];
  const [emailNewsletter, setEmailNewsletter] = useState("");
  const [newsletterEnvoyee, setNewsletterEnvoyee] = useState(false);
  const [proches, setProches] = useState<VehiculeVus[]>([]);
  const [etatGeo, setEtatGeo] = useState<"idle" | "chargement" | "refuse" | "ok">("idle");
  const [vendeurs, setVendeurs] = useState<VendeurVedette[]>([]);
  const [chargementVendeurs, setChargementVendeurs] = useState(true);
  // incrémenté par le bouton Recharger : c'est ce qui redéclenche le useEffect ci-dessous
  const [tentativeVendeurs, setTentativeVendeurs] = useState(0);

  useEffect(() => {
    // `annule` évite un setState sur un composant démonté si la réponse arrive trop tard
    let annule = false;

    recupererVendeursVedettes().then((liste) => {
      if (annule) return;
      setVendeurs(liste);
      setChargementVendeurs(false);
    });

    return () => {
      annule = true;
    };
  }, [tentativeVendeurs]);

  const rechargerVendeurs = () => {
    setChargementVendeurs(true);
    setTentativeVendeurs((t) => t + 1);
  };

  const handleGeo = () => {
    // a. l'API n'existe pas hors contexte sécurisé : on sort avant de la toucher
    if (!("geolocation" in navigator)) {
      setEtatGeo("refuse");
      return;
    }

    // b. posé AVANT l'appel : la popup puis le fix GPS peuvent durer plusieurs secondes
    setEtatGeo("chargement");

    // d. le navigateur appelle ceci quand il a la position
    const succes = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;

      recupererVehiculesProches(latitude, longitude).then((vehicules) => {
        setProches(vehicules);
        setEtatGeo("ok");
      });
    };

    // e. refus de l'utilisateur, position indisponible ou délai dépassé
    const erreur = () => setEtatGeo("refuse");

    // c. API à callbacks : on passe les deux fonctions, le navigateur en appellera UNE
    navigator.geolocation.getCurrentPosition(succes, erreur, { timeout: 10_000 });
  };
  const soumettreNewsletter = (evenement: SubmitEvent<HTMLFormElement>) => {
    // sans preventDefault, le <form> recharge la page et le state est perdu
    evenement.preventDefault();

    /*
    ÉTAPE 5 — Câbler l'inscription (rien à faire tant que le back n'a pas bougé).
      5.1 Aucun endpoint newsletter n'existe dans vroom-backend/routes/api.php.
          Cette section est donc une coquille visuelle : elle n'enregistre RIEN.
      5.2 Côté Laravel, à créer avant : une table `abonnes_newsletter` (email unique,
          token_desinscription, timestamps) + POST /api/newsletter, route publique.
      5.3 Ici, remplace le setNewsletterEnvoyee(true) direct par un appel à cette route,
          et ajoute un 3e état "erreur" : un email déjà inscrit doit renvoyer un message,
          pas un faux succès.
    */
    setNewsletterEnvoyee(true);
    setEmailNewsletter("");
  };

  const scrollCategories = (direction: "left" | "right") => {
    if (VehiculeScrollRef.current) {
      const { scrollLeft, clientWidth } = VehiculeScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      VehiculeScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };
  return (
    <div>
      <HeroCarousel slides={heroSlides} />
      <section className="m-5">
        {/* Les flèches sont FRÈRES du rail, pas ses enfants : sinon elles défilent avec lui */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Vehicules les plus vues</h1>
        </div>

        <div
          ref={VehiculeScrollRef}
          className="mt-6 flex gap-4 overflow-x-hidden pb-4"
        >
          {VehiculesPlusVus.map((vehicule) => (
            <CarteVehicule
              key={vehicule.id}
              vehicule={vehicule}
              className="w-64 shrink-0 sm:w-72"
            />
          ))}
        </div>

        <div className="flex justify-end items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="effet-action"
            onClick={() => scrollCategories("left")}
            aria-label="Véhicules précédents"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="effet-action"
            onClick={() => scrollCategories("right")}
            aria-label="Véhicules suivants"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Comment ça marche</h1>
        </div>
        <div className="text-center">
          <h2 className="mt-4 font-heading text-3xl font-bold md:text-4xl">
            Du compte créé à la poignée de main
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Choisissez votre profil : les 4 étapes qui vous concernent s&apos;affichent.
          </p>
        </div>

        <div role="tablist" className="mt-10 flex flex-wrap justify-center gap-2">
          {PARCOURS.map((profil) => (
            <button
              key={profil.id}
              type="button"
              role="tab"
              aria-selected={profil.id === profilActif}
              onClick={() => setProfilActif(profil.id)}
              className={cn(
                "rounded-4xl px-5 py-2.5 text-sm font-semibold transition-colors",
                profil.id === profilActif
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-foreground"
              )}
            >
              {profil.libelle}
            </button>
          ))}
        </div>

        <div className="relative mt-12 grid gap-8 md:grid-cols-4">
          {/* La ligne est FRÈRE des cartes, pas leur parent : sinon elle se replierait dans la 1re colonne */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-6 hidden h-px bg-linear-to-r from-transparent via-primary to-transparent md:block"
          />

          {parcours.etapes.map((etape) => {
            // capitalisé : en minuscule, JSX lirait <etape.icone> comme une balise HTML inconnue
            const Icone = etape.icone;

            return (
              <article
                key={etape.numero}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-full border border-primary bg-background text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icone className="size-5" />
                </div>

                <span className="mt-4 text-xs font-bold tracking-widest text-primary">
                  {`0${etape.numero}`}
                </span>
                <h3 className="mt-1 font-heading text-lg font-bold">{etape.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{etape.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href={parcours.href}
            className={cn(buttonVariants({ size: "lg" }), "effet-action")}
          >
            {parcours.libelleAction}
          </Link>
        </div>
      </section>

      {/* Près de chez vous */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Près de chez vous</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Les véhicules disponibles dans votre ville, sans traverser Abidjan pour un essai.
        </p>

        {/* Déclenché au clic, jamais au montage : une popup non sollicitée fait fuir */}
        {etatGeo === "idle" && (
          <div className="mt-10 flex justify-center">
            <Button size="lg" className="effet-action" onClick={handleGeo}>
              <MapPin className="size-4" />
              Voir les véhicules près de moi
            </Button>
          </div>
        )}

        {/* Skeletons au format exact des cartes : la page ne saute pas à l'arrivée des données */}
        {etatGeo === "chargement" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-3/4 w-full" />
            ))}
          </div>
        )}

        {etatGeo === "refuse" && (
          <div className="mt-10 rounded-2xl border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nous n&apos;avons pas pu vous localiser. Parcourez le catalogue et
              filtrez par ville pour trouver un véhicule près de chez vous.
            </p>
            <Link
              href="/vehicules"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "effet-action mt-4"
              )}
            >
              Voir tout le catalogue
            </Link>
          </div>
        )}

        {etatGeo === "ok" &&
          (proches.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Aucun véhicule dans votre zone pour l&apos;instant.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {proches.map((vehicule) => (
                <CarteVehicule key={vehicule.id} vehicule={vehicule} />
              ))}
            </div>
          ))}
      </section>

      {/* Pourquoi Move CI */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Pourquoi Move CI</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Acheter une voiture d&apos;occasion, c&apos;est faire confiance à un inconnu. Voilà ce
            qu&apos;on met en place pour que ce ne soit pas un pari.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ARGUMENTS_CONFIANCE.map((argument) => {
              const Icone = argument.icone;

              return (
                <article
                  key={argument.titre}
                  className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icone className="size-5" />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-bold">{argument.titre}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{argument.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ils vendent sur Move CI */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Ils vendent sur Move CI</h1>
          <BoutonRecharger onClick={rechargerVendeurs} chargement={chargementVendeurs} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Concessionnaires et vendeurs particuliers, notés par leurs acheteurs.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chargementVendeurs
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full" />
              ))
            : vendeurs.map((vendeur) => (
                <article
                  key={vendeur.id}
                  className="group rounded-2xl border border-border p-6 transition-colors hover:border-primary"
                >
                  <div className="flex items-center gap-4">
                    {/* avatar de repli : le backend renvoie null tant que l'utilisateur n'en a pas */}
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground">
                      {initiales(vendeur.fullname)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-heading text-lg font-bold">
                        {vendeur.fullname}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {LIBELLES_ROLE[vendeur.role]}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Star className="size-4 fill-primary text-primary" />
                      {vendeur.note_moyenne.toFixed(1)}
                      <span className="font-normal text-muted-foreground">
                        ({vendeur.nb_avis} avis)
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {vendeur.nb_vehicules} véhicules en ligne
                    </span>
                  </div>

                  <Link
                    href={`/vendeurs/${vendeur.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "effet-action mt-6 w-full"
                    )}
                  >
                    Voir le profil
                  </Link>
                </article>
              ))}
        </div>
      </section>

      {/* Questions fréquentes */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Questions fréquentes</h1>
        </div>

        <div className="mt-8 divide-y divide-border border-y border-border">
          {FAQ.map((item) => (
            // <details> natif : l'accordéon fonctionne même si le JS ne charge pas
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.reponse}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-heading text-2xl font-bold md:text-3xl">
              Ne ratez pas la bonne affaire
            </h1>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
              Les nouvelles annonces de votre ville et les baisses de prix, une fois par
              semaine. Rien d&apos;autre, et vous vous désinscrivez en un clic.
            </p>
          </div>

          {newsletterEnvoyee ? (
            // role="status" : un lecteur d'écran annonce la confirmation sans déplacer le focus
            <p role="status" className="flex items-center gap-2 font-semibold md:justify-end">
              <Check className="size-5" />
              C&apos;est noté, à la semaine prochaine.
            </p>
          ) : (
            <form onSubmit={soumettreNewsletter} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="email-newsletter" className="sr-only">
                Votre adresse email
              </label>
              <Input
                id="email-newsletter"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={emailNewsletter}
                onChange={(evenement) => setEmailNewsletter(evenement.target.value)}
                placeholder="votre@email.ci"
                className="h-11 bg-background text-foreground"
              />
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                className="effet-action shrink-0"
              >
                <Mail className="size-4" />
                Je m&apos;inscris
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
