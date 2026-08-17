"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Car,
  ChevronLeft,
  MessagesSquare,
  Search,
  SendHorizontal,
} from "lucide-react";

import BoutonRecharger from "@/components/BoutonRecharger";
import BulleMessage from "@/components/BulleMessage";
import LigneConversation from "@/components/LigneConversation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cn,
  etiquetteJour,
  formaterFcfa,
  grouperParJour,
  urlPhoto,
} from "@/lib/utils";
import { libelleVehicule, photoPrincipale } from "@/lib/vehicule";
import type { Conversation, MessageChat, ParticipantConversation } from "@/types";

/* ────────────────────────────────────────────────────────────────────────────
   MESSAGERIE — contenu partagé entre /messages et /admin/messages (un seul
   composant, un thin page.tsx par rôle, pour hériter du bon layout).
   Miroir de ConversationController (vroom-backend/app/Http/Controllers).
/** L'utilisateur connecté. Au branchement, il viendra du cookie de session, pas d'une constante. */
const MOI_ID = "b1e7c3d2-5a49-4f18-9c26-3d8b1a0e7f54";

const MOI: ParticipantConversation = {
  id: MOI_ID,
  fullname: "Jean-David Kouassi",
  avatar: null,
  role: "client",
};

const KOFFI: ParticipantConversation = {
  id: "3f8a1b2c-9d7e-4f60-a531-8c4e6b2a9f03",
  fullname: "Koffi Aristide",
  avatar: null,
  role: "vendeur",
};

const AWA: ParticipantConversation = {
  id: "9d4e2f1a-6c3b-4a71-8e15-2b7f0c9d4e11",
  fullname: "Awa Traoré",
  avatar: null,
  role: "concessionnaire",
};

const BOA: ParticipantConversation = {
  id: "5e1c7a93-2d84-4b06-9f37-1a5d8e2c4b70",
  fullname: "Jean-Marc Boa",
  avatar: null,
  role: "vendeur",
};

const FATOU: ParticipantConversation = {
  id: "c8b4a2f1-7e39-4d52-8a61-3f0b9c7d5e24",
  fullname: "Fatou Diomandé",
  avatar: null,
  role: "auto_ecole",
};

/**
 * Quatre conversations, chacune pour exercer un cas de rendu précis :
 * [0] 3 non-lus, la plus récente — [1] dernier message de moi (« Vous : »)
 * [2] jamais entamée (last_message null) — [3] véhicule sans description ni photo.
 */
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c0000000-0000-4000-8000-000000000001",
    participant_1_id: MOI_ID,
    participant_2_id: KOFFI.id,
    vehicule_id: "2c1d0e9f-8a7b-4c6d-9e5f-4a3b2c1d0e9f",
    last_message_at: "2026-08-14T09:12:00.000000Z",
    created_at: "2026-08-12T10:04:00.000000Z",
    unread_count: 3,
    other_participant: KOFFI,
    last_message: {
      content: "Je peux vous le montrer samedi matin si ça vous arrange.",
      created_at: "2026-08-14T09:12:00.000000Z",
      sender_id: KOFFI.id,
    },
    vehicule: {
      id: "2c1d0e9f-8a7b-4c6d-9e5f-4a3b2c1d0e9f",
      created_by: KOFFI.id,
      post_type: "vente",
      type: "occasion",
      statut: "disponible",
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
    id: "c0000000-0000-4000-8000-000000000002",
    participant_1_id: MOI_ID,
    participant_2_id: AWA.id,
    vehicule_id: "5d4c3b2a-1f0e-4998-8776-655443322110",
    last_message_at: "2026-08-13T18:40:00.000000Z",
    created_at: "2026-08-13T17:55:00.000000Z",
    unread_count: 0,
    other_participant: AWA,
    last_message: {
      content: "Parfait, je vous confirme demain. Merci !",
      created_at: "2026-08-13T18:40:00.000000Z",
      sender_id: MOI_ID,
    },
    vehicule: {
      id: "5d4c3b2a-1f0e-4998-8776-655443322110",
      created_by: AWA.id,
      post_type: "location",
      type: "occasion",
      statut: "disponible",
      prix: "45000.00",
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
    id: "c0000000-0000-4000-8000-000000000003",
    participant_1_id: MOI_ID,
    participant_2_id: BOA.id,
    vehicule_id: "0e9f8a7b-6c5d-4e3f-8a1b-2c3d4e5f6a7b",
    // créée par findOrCreate depuis la fiche véhicule, jamais suivie d'un message
    last_message_at: null,
    created_at: "2026-08-11T14:22:00.000000Z",
    unread_count: 0,
    other_participant: BOA,
    last_message: null,
    vehicule: {
      id: "0e9f8a7b-6c5d-4e3f-8a1b-2c3d4e5f6a7b",
      created_by: BOA.id,
      post_type: "vente",
      type: "occasion",
      statut: "réservé",
      prix: "3100000.00",
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
    id: "c0000000-0000-4000-8000-000000000004",
    participant_1_id: MOI_ID,
    participant_2_id: FATOU.id,
    vehicule_id: "4a3b2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d",
    last_message_at: "2026-08-10T11:05:00.000000Z",
    created_at: "2026-08-10T10:30:00.000000Z",
    unread_count: 1,
    other_participant: FATOU,
    last_message: {
      content: "Le véhicule est encore en cours de validation de notre côté.",
      created_at: "2026-08-10T11:05:00.000000Z",
      sender_id: FATOU.id,
    },
    vehicule: {
      id: "4a3b2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d",
      created_by: FATOU.id,
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

/** Messages indexés par `conversation_id`, triés du plus ancien au plus récent comme le back. */
const MOCK_MESSAGES: Record<string, MessageChat[]> = {
  "c0000000-0000-4000-8000-000000000001": [
    {
      id: "m1000000-0000-4000-8000-000000000001",
      conversation_id: "c0000000-0000-4000-8000-000000000001",
      sender_id: MOI_ID,
      receiver_id: KOFFI.id,
      content:
        "Bonjour, votre RAV4 m'intéresse. Est-il toujours disponible ? Le kilométrage annoncé est bien de 48 500 km ?",
      is_read: true,
      read_at: "2026-08-12T10:31:00.000000Z",
      created_at: "2026-08-12T10:04:00.000000Z",
      sender: MOI,
    },
    {
      id: "m1000000-0000-4000-8000-000000000002",
      conversation_id: "c0000000-0000-4000-8000-000000000001",
      sender_id: KOFFI.id,
      receiver_id: MOI_ID,
      content:
        "Bonjour ! Oui, toujours disponible. 48 500 km au compteur, la photo du tableau de bord est dans l'annonce.",
      is_read: true,
      read_at: "2026-08-12T10:48:00.000000Z",
      created_at: "2026-08-12T10:35:00.000000Z",
      sender: KOFFI,
    },
    {
      id: "m1000000-0000-4000-8000-000000000003",
      conversation_id: "c0000000-0000-4000-8000-000000000001",
      sender_id: MOI_ID,
      receiver_id: KOFFI.id,
      content: "Le prix est négociable ? J'ai vu que vous étiez sous l'estimation.",
      is_read: true,
      read_at: "2026-08-13T08:02:00.000000Z",
      created_at: "2026-08-13T07:50:00.000000Z",
      sender: MOI,
    },
    {
      id: "m1000000-0000-4000-8000-000000000004",
      conversation_id: "c0000000-0000-4000-8000-000000000001",
      sender_id: KOFFI.id,
      receiver_id: MOI_ID,
      content:
        "Un peu, oui. Mais pas beaucoup, je suis déjà 500 000 F sous l'estimation de la plateforme.",
      is_read: true,
      read_at: "2026-08-13T08:20:00.000000Z",
      created_at: "2026-08-13T08:11:00.000000Z",
      sender: KOFFI,
    },
    // les trois derniers sont les non_lus du compteur : read_at à null
    {
      id: "m1000000-0000-4000-8000-000000000005",
      conversation_id: "c0000000-0000-4000-8000-000000000001",
      sender_id: KOFFI.id,
      receiver_id: MOI_ID,
      content: "Vous seriez disponible pour un essai cette semaine ?",
      is_read: false,
      read_at: null,
      created_at: "2026-08-14T09:05:00.000000Z",
      sender: KOFFI,
    },
    {
      id: "m1000000-0000-4000-8000-000000000006",
      conversation_id: "c0000000-0000-4000-8000-000000000001",
      sender_id: KOFFI.id,
      receiver_id: MOI_ID,
      content: "Je suis à Cocody, Riviera 3.",
      is_read: false,
      read_at: null,
      created_at: "2026-08-14T09:06:00.000000Z",
      sender: KOFFI,
    },
    {
      id: "m1000000-0000-4000-8000-000000000007",
      conversation_id: "c0000000-0000-4000-8000-000000000001",
      sender_id: KOFFI.id,
      receiver_id: MOI_ID,
      content: "Je peux vous le montrer samedi matin si ça vous arrange.",
      is_read: false,
      read_at: null,
      created_at: "2026-08-14T09:12:00.000000Z",
      sender: KOFFI,
    },
  ],
  "c0000000-0000-4000-8000-000000000002": [
    {
      id: "m2000000-0000-4000-8000-000000000001",
      conversation_id: "c0000000-0000-4000-8000-000000000002",
      sender_id: MOI_ID,
      receiver_id: AWA.id,
      content:
        "Bonjour, le Sportage est disponible à partir du 20 août d'après l'annonce. C'est bien 45 000 F par jour ?",
      is_read: true,
      read_at: "2026-08-13T18:10:00.000000Z",
      created_at: "2026-08-13T17:55:00.000000Z",
      sender: MOI,
    },
    {
      id: "m2000000-0000-4000-8000-000000000002",
      conversation_id: "c0000000-0000-4000-8000-000000000002",
      sender_id: AWA.id,
      receiver_id: MOI_ID,
      content:
        "Exact, 45 000 F/jour, carburant non inclus. À partir de 7 jours je descends à 40 000.",
      is_read: true,
      read_at: "2026-08-13T18:38:00.000000Z",
      created_at: "2026-08-13T18:22:00.000000Z",
      sender: AWA,
    },
    {
      id: "m2000000-0000-4000-8000-000000000003",
      conversation_id: "c0000000-0000-4000-8000-000000000002",
      sender_id: MOI_ID,
      receiver_id: AWA.id,
      content: "Parfait, je vous confirme demain. Merci !",
      is_read: false,
      read_at: null,
      created_at: "2026-08-13T18:40:00.000000Z",
      sender: MOI,
    },
  ],
  // conversation créée sans message : le fil doit afficher son propre état vide
  "c0000000-0000-4000-8000-000000000003": [],
  "c0000000-0000-4000-8000-000000000004": [
    {
      id: "m4000000-0000-4000-8000-000000000001",
      conversation_id: "c0000000-0000-4000-8000-000000000004",
      sender_id: MOI_ID,
      receiver_id: FATOU.id,
      content: "Bonjour, ce véhicule est-il encore réservable ?",
      is_read: true,
      read_at: "2026-08-10T11:00:00.000000Z",
      created_at: "2026-08-10T10:30:00.000000Z",
      sender: MOI,
    },
    {
      id: "m4000000-0000-4000-8000-000000000002",
      conversation_id: "c0000000-0000-4000-8000-000000000004",
      sender_id: FATOU.id,
      receiver_id: MOI_ID,
      content: "Le véhicule est encore en cours de validation de notre côté.",
      is_read: false,
      read_at: null,
      created_at: "2026-08-10T11:05:00.000000Z",
      sender: FATOU,
    },
  ],
};

/** Même contrat que GET /conversations. Seul ce corps changera au branchement. */
function recupererConversations(): Promise<Conversation[]> {
  // 700 ms : sans délai, l'état de chargement n'est jamais observable
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_CONVERSATIONS), 700)
  );
}

/** Même contrat que GET /conversations/{id}/messages. */
function recupererMessages(conversationId: string): Promise<MessageChat[]> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_MESSAGES[conversationId] ?? []), 400)
  );
}

/**
 * Même contrat que POST /conversations/{id}/messages : le back répond 201 avec
 * `{ success, message }`. Renvoyer le message CRÉÉ (et pas void) est ce qui
 * permet de remplacer la bulle optimiste par la vraie sans réécrire l'appelant.
 */
function envoyerMessage(
  conversationId: string,
  contenu: string,
  destinataireId: string
): Promise<MessageChat> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          id: crypto.randomUUID(),
          conversation_id: conversationId,
          sender_id: MOI_ID,
          receiver_id: destinataireId,
          content: contenu,
          is_read: false,
          read_at: null,
          created_at: new Date().toISOString(),
          sender: MOI,
        }),
      500
    )
  );
}

export default function MessagerieContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [idOuverte, setIdOuverte] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [chargementListe, setChargementListe] = useState(true);
  // false et non true : aucun fil n'est ouvert au premier rendu
  const [chargementFil, setChargementFil] = useState(false);
  const [brouillon, setBrouillon] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  // incrémenté par le bouton Recharger : c'est ce qui redéclenche le useEffect ci-dessous
  const [tentativeListe, setTentativeListe] = useState(0);

  const finDuFil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `annule` évite un setState sur un composant démonté si la réponse arrive trop tard
    let annule = false;

    recupererConversations().then((liste) => {
      if (annule) return;
      setConversations(liste);
      setChargementListe(false);
    });

    return () => {
      annule = true;
    };
  }, [tentativeListe]);

  const rechargerListe = () => {
    setChargementListe(true);
    setTentativeListe((t) => t + 1);
  };

  // sans ça, chaque message envoyé part sous la ligne de flottaison
  useEffect(() => {
    finDuFil.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  /**
   * La conversation ouverte est DÉRIVÉE, jamais stockée : deux états décrivant
   * la même chose finissent par diverger — on remettrait `unread_count` à zéro
   * dans l'un et pas dans l'autre.
   */
  const ouverte = conversations.find((c) => c.id === idOuverte) ?? null;

  const triees = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        // conversation jamais entamée : reléguée en bas, elle n'a rien à raconter
        if (!a.last_message_at) return 1;
        if (!b.last_message_at) return -1;
        // les ISO 8601 se comparent lexicographiquement, pas besoin de new Date()
        return b.last_message_at.localeCompare(a.last_message_at);
      }),
    [conversations]
  );

  const groupes = useMemo(
    () => grouperParJour(messages, (message) => message.created_at),
    [messages]
  );

  const ouvrirConversation = (id: string) => {
    setIdOuverte(id);
    setChargementFil(true);
    setErreur(null);
    // vider AVANT de charger : sinon les messages du fil précédent restent
    // affichés sous le nouvel en-tête pendant tout le chargement
    setMessages([]);

    recupererMessages(id).then((liste) => {
      setMessages(liste);
      setChargementFil(false);
    });

    /**
     * `ConversationController::messages()` marque les messages reçus comme lus
     * en effet de bord. Le serveur a donc déjà oublié ces non-lus, mais le
     * tableau local en porte encore le compte : sans cette remise à zéro, la
     * pastille gold reste allumée sur une conversation qu'on vient de lire.
     */
    setConversations((liste) =>
      liste.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c))
    );
  };

  const envoyer = () => {
    const contenu = brouillon.trim();
    if (!contenu || !ouverte) return;

    // le préfixe `temp-` sert aussi de marqueur « en attente » à l'affichage :
    // pas besoin d'un état supplémentaire pour suivre les envois en cours
    const idTemporaire = `temp-${Date.now()}`;
    const provisoire: MessageChat = {
      id: idTemporaire,
      conversation_id: ouverte.id,
      sender_id: MOI_ID,
      receiver_id: ouverte.other_participant.id,
      content: contenu,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      sender: MOI,
    };

    setErreur(null);
    setMessages((liste) => [...liste, provisoire]);
    // vider tout de suite : un champ qui attend la réponse serveur donne une
    // interface qui colle, 500 ms où l'utilisateur croit que sa touche n'a rien fait
    setBrouillon("");

    envoyerMessage(ouverte.id, contenu, ouverte.other_participant.id)
      .then((reel) => {
        setMessages((liste) =>
          liste.map((m) => (m.id === idTemporaire ? reel : m))
        );

        // l'aperçu de gauche mentirait sans cette mise à jour
        setConversations((liste) =>
          liste.map((c) =>
            c.id === reel.conversation_id
              ? {
                  ...c,
                  last_message_at: reel.created_at,
                  last_message: {
                    content: reel.content,
                    created_at: reel.created_at,
                    sender_id: reel.sender_id,
                  },
                }
              : c
          )
        );
      })
      .catch(() => {
        setMessages((liste) => liste.filter((m) => m.id !== idTemporaire));
        // on rend le texte : un message perdu à l'envoi coûte bien plus qu'un favori
        setBrouillon((actuel) => actuel || contenu);
        setErreur("Le message n'est pas parti. Votre texte a été restauré.");
      });
  };

  if (chargementListe) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
          <div className="space-y-px">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="hidden h-128 w-full lg:block" />
        </div>
      </main>
    );
  }

  if (conversations.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
        <section className="rounded-2xl border border-border p-12 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessagesSquare className="size-7" />
          </span>
          <h1 className="mt-6 font-heading text-2xl font-bold">
            Aucune conversation
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Une conversation démarre depuis une annonce, jamais d&apos;ici :
            elle reste attachée au véhicule dont vous parlez. Ouvrez une fiche
            et contactez le vendeur.
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
    // 4rem = la hauteur du Header (h-16, sticky). dvh et non vh : sur mobile,
    // vh ignore la barre d'adresse et le composeur passe sous l'écran.
    // pas de flex-1 ici : son flex-basis:0% écraserait le h-[calc(...)] qui suit
    <main className="mx-auto flex h-[calc(100dvh-4rem)] min-h-0 w-full max-w-7xl flex-col lg:px-5 lg:py-6">
      {/* grid-rows-[minmax(0,1fr)] : l'équivalent vertical du minmax(0,…) des colonnes */}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-5">
        {/* ── Panneau gauche : la liste ─────────────────────────────────── */}
        <aside
          className={cn(
            "min-h-0 flex-col overflow-hidden border-border lg:flex lg:rounded-md lg:border",
            // mobile : un seul panneau à l'écran à la fois
            idOuverte ? "hidden" : "flex"
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4">
            <div>
              <h1 className="font-heading text-lg font-bold">Messages</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {conversations.length} conversation
                {conversations.length > 1 ? "s" : ""}, chacune liée à un véhicule.
              </p>
            </div>
            <BoutonRecharger onClick={rechargerListe} chargement={chargementListe} />
          </header>

          <div className="sans-barre-scroll min-h-0 flex-1 overflow-y-auto">
            {triees.map((conversation) => (
              <LigneConversation
                key={conversation.id}
                conversation={conversation}
                moiId={MOI_ID}
                active={conversation.id === idOuverte}
                onOuvrir={ouvrirConversation}
              />
            ))}
          </div>
        </aside>

        {/* ── Panneau droit : le fil ────────────────────────────────────── */}
        <section
          className={cn(
            "min-h-0 flex-col overflow-hidden border-border lg:flex lg:rounded-md lg:border",
            idOuverte ? "flex" : "hidden lg:flex"
          )}
        >
          {!ouverte ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <MessagesSquare className="size-6" />
              </span>
              <p className="mt-4 font-heading text-sm font-bold">
                Sélectionnez une conversation
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Le véhicule concerné restera affiché en haut du fil pendant tout
                l&apos;échange.
              </p>
            </div>
          ) : (
            <>
              <EnteteFil
                conversation={ouverte}
                onRetour={() => setIdOuverte(null)}
              />

              {/* bg-muted et non blanc : sans fond, les cartes blanches d'en face sont invisibles */}
              <div className="sans-barre-scroll min-h-0 flex-1 space-y-6 overflow-y-auto bg-muted px-4 pb-6 pt-5">
                {chargementFil ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        index % 2 === 0 ? "justify-start" : "justify-end"
                      )}
                    >
                      <Skeleton className="h-16 w-3/5 rounded-md" />
                    </div>
                  ))
                ) : messages.length === 0 ? (
                  <p className="py-10 text-center text-xs text-muted-foreground">
                    Aucun message pour l&apos;instant. Écrivez le premier.
                  </p>
                ) : (
                  groupes.map((groupe) => (
                    // space-y-1.5 entre bulles : des messages qui se suivent forment
                    // un bloc de parole, l'air se met ENTRE les journées, pas dedans
                    <div key={groupe.jour} className="space-y-1.5">
                      <p className="mb-3 text-center text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {etiquetteJour(groupe.jour)}
                      </p>

                      {groupe.elements.map((message) => (
                        <BulleMessage
                          key={message.id}
                          message={message}
                          deMoi={message.sender_id === MOI_ID}
                          enAttente={message.id.startsWith("temp-")}
                        />
                      ))}
                    </div>
                  ))
                )}

                {/* sentinelle d'auto-scroll : elle n'affiche rien, elle sert de cible */}
                <div ref={finDuFil} />
              </div>

              {/* role="status" : le lecteur d'écran annonce l'échec sans déplacer le focus */}
              {erreur && (
                <p
                  role="status"
                  className="shrink-0 border-t border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs text-destructive"
                >
                  {erreur}
                </p>
              )}

              <Composeur
                valeur={brouillon}
                onChange={setBrouillon}
                onEnvoyer={envoyer}
                contact={ouverte.other_participant.fullname}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/**
 * Bandeau collant du fil : le véhicule dont on parle, plus le contact.
 *
 * Il ne sort jamais de l'écran — c'est le sujet de la conversation, et sur une
 * plateforme où l'on discute d'un prix, perdre de vue lequel est un vrai risque.
 */
function EnteteFil({
  conversation,
  onRetour,
}: {
  conversation: Conversation;
  onRetour: () => void;
}) {
  const { vehicule, other_participant: contact } = conversation;
  const photo = photoPrincipale(vehicule.photos);
  const estLocation = vehicule.post_type === "location";

  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-border bg-background px-3 py-3 sm:px-4">
      <button
        type="button"
        onClick={onRetour}
        aria-label="Retour à la liste des conversations"
        className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
      >
        <ChevronLeft className="size-5" />
      </button>

      <Link
        href={`/vehicules/${vehicule.id}`}
        className="group flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="size-11 shrink-0 overflow-hidden rounded-md bg-muted">
          {photo ? (
            <img
              src={urlPhoto(photo.path)}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <Car className="size-5" />
            </span>
          )}
        </span>

        <span className="min-w-0">
          <span className="block truncate font-heading text-sm font-bold transition-colors group-hover:text-primary">
            {libelleVehicule(vehicule.description, vehicule.id)}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {contact.fullname} · {/* Number() : `prix` est une string, un + concatènerait */}
            <span className="tabular-nums">
              {formaterFcfa(Number(vehicule.prix))}
              {estLocation && " / jour"}
            </span>
          </span>
        </span>
      </Link>

      <Badge
        variant="outline"
        className="hidden shrink-0 sm:inline-flex"
      >
        {estLocation ? "Location" : "Vente"}
      </Badge>
    </header>
  );
}

/** Zone de saisie. Entrée envoie, Maj+Entrée saute une ligne. */
function Composeur({
  valeur,
  onChange,
  onEnvoyer,
  contact,
}: {
  valeur: string;
  onChange: (valeur: string) => void;
  onEnvoyer: () => void;
  contact: string;
}) {
  const vide = valeur.trim().length === 0;

  return (
    <div className="flex shrink-0 items-end gap-2 border-t border-border bg-background px-3 py-3 sm:px-4">
      <textarea
        rows={1}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // sans preventDefault, Entrée envoie ET insère un retour à la ligne
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onEnvoyer();
          }
        }}
        placeholder={`Écrire à ${contact}…`}
        aria-label={`Écrire un message à ${contact}`}
        // field-sizing-content : le champ grandit avec le texte, plafonné à max-h
        className="max-h-32 min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors field-sizing-content placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
      />

      <Button
        type="button"
        size="icon"
        onClick={onEnvoyer}
        disabled={vide}
        aria-label="Envoyer le message"
        className="effet-action size-10 shrink-0"
      >
        <SendHorizontal className="size-4" />
      </Button>
    </div>
  );
}
