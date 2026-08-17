/**
 * Types partagés dans toute l'app. Tout ce qui décrit une donnée venant du
 * backend Laravel vit ici — pas dans la page qui l'affiche.
 */

/** Les cinq rôles portés par `users.role` (vroom-backend/app/Models/User.php). */

export type RoleUser =
  | "client"
  | "vendeur"
  | "concessionnaire"
  | "auto_ecole"
  | "admin";

/** Les quatre valeurs de `users.statut` (constantes du modèle User, lignes 65-68). */
export type StatutUser = "actif" | "en_attente" | "suspendu" | "banni";

export type User = {
  /** UUID côté Laravel (le modèle utilise HasUuids), jamais un entier. */
  id: string;
  fullname: string;
  avatar: string | null;
  role: RoleUser;
  /** Date d'inscription au format ISO 8601. */
  membre_since: string;
  /** Moyenne des avis sur 5, arrondie au dixième. Vaut 0 si aucun avis. */
  note_moyenne: number;
  nb_avis: number;
  /** Absents de la réponse quand le rôle est `client` : profil réduit. */
  adresse?: string | null;
  telephone?: string | null;
  /** Renvoyés par login/register (modèle complet), absents de profil(). */
  email?: string;
  statut?: StatutUser;
};

/**
 * Carte vendeur de la page d'accueil. `Pick` dérive les champs de `User` au lieu
 * de les recopier : si la réponse du backend change, la correction se fait à un
 * seul endroit et TypeScript signale ici tout champ disparu.
 */
export type VendeurVedette = Pick<
  User,
  "id" | "fullname" | "avatar" | "role" | "note_moyenne" | "nb_avis"
> & {
  /** `data.vehicules.length` dans profil() : les véhicules EN LIGNE, pas les vendus. */
  nb_vehicules: number;
};

/**
 * Réponse commune à `POST /api/login` et `POST /api/register`
 * (AuthController::login ligne 133, register ligne 177).
 */
export type ReponseAuth = {
  success: true;
  /** Token Sanctum en clair. Il ne doit JAMAIS finir dans localStorage : cookie httpOnly. */
  token: string;
  role: RoleUser;
  user: User;
};

/**
 * Erreur renvoyée par l'API d'authentification. `login` répond 401 sur mauvais
 * identifiants et 403 avec un message différent par statut (lignes 119-130) ;
 * `register` répond 422 avec les erreurs de validation champ par champ.
 */
export type ErreurAuth = {
  success: false;
  /**
   * Code HTTP. Il n'est PAS dans le corps JSON : c'est le client qui le recopie
   * depuis `reponse.status` avant de rejeter. Sans lui, impossible de distinguer
   * un 401 (mauvais identifiants) d'un 403 (compte bloqué), les deux ayant un
   * `message` mais appelant un traitement différent.
   */
  status: number;
  message: string;
  /** Présent uniquement sur un 422 : { email: ["Cet email est déjà utilisé."] }. */
  errors?: Record<string, string[]>;
};

/** Les 8 valeurs de `vehicules.statut` (constantes du modèle Vehicules, lignes 44-53). */
export type StatutVehicule =
  | "disponible"
  | "a_venir"
  | "réservé"
  | "vendu"
  | "loué"
  | "suspendu"
  | "banni"
  | "en_transaction";

/** `vehicules.post_type` : le véhicule est-il à vendre ou à louer (lignes 40-41). */
export type PostTypeVehicule = "vente" | "location";

/** `vehicules.type` : état du véhicule (lignes 42-43). À ne pas confondre avec `post_type`. */
export type TypeVehicule = "neuf" | "occasion";

/**
 * `vehicules.status_validation` : le cycle de modération Gemini, PLUS les deux
 * valeurs que seul l'admin déclenche — absentes tant que rien ne les montrait.
 * `suspendu` : suspension administrative (Vehicules::suspendre(), ligne 147).
 * `retrait` : présent dans le CHECK de la migration, mais AUCUN code ne
 * l'assigne encore — à traiter en repli, pas à supposer atteignable.
 */
export type StatutValidation =
  | "en_attente"
  | "validee"
  | "rejetee"
  | "suspendu"
  | "restauree"
  | "retrait";

/** Une carte du rail « Véhicules les plus vus » de la page d'accueil. */
export type VehiculeVus = {
  id: number;
  marque: string;
  modele: string;
  image: string;
  /** Fiche du véhicule, cible du lien "Découvrir" : "/vehicules/1". */
  href: string;
  /** Commune d'Abidjan où se trouve le véhicule : "Cocody". Affichée dans « Près de chez vous ». */
  commune?: string;
};


/** Les 7 compteurs du bloc `stats`. Tous calculés sur `created_by = utilisateur courant`. */
export type CompteursVendeur = {
  /** Véhicules au statut `disponible` UNIQUEMENT — ce n'est pas le stock total. */
  total_vehicule: number;
  total_vehicule_vendu: number;
  total_vehicule_loue: number;
  /** Somme de `vehicules.views_count`, cumul depuis toujours. */
  total_vues: number;
  /** Vues des véhicules CRÉÉS ce mois-ci, pas les vues reçues ce mois-ci. Le back filtre sur `created_at` du véhicule. */
  total_vues_mois: number;
  /** Lignes `vehicule_vues` datées d'aujourd'hui : celle-ci est bien une vue du jour. */
  total_vues_jour: number;
  /** Somme des `prix` des véhicules passés à `vendu` ce mois-ci, en FCFA (XOF), entier. */
  total_revenus: number;
};

/** Un des 12 points de `stats_mensuel`, de janvier à décembre de l'année courante. */
export type PointMois = {
  /** 1 à 12. */
  mois: number;
  /** Nom français minuscule tel que renvoyé par Carbon : "janvier". */
  nom_mois: string;
  ventes: number;
  vues: number;
  /** Bug back connu : ce champ ne filtre pas sur `created_by` (VendeurStatsController.php:53). */
  locations: number;
};

/** Un des 7 points de `stats_semaine`, du lundi au dimanche de la semaine en cours. */
export type PointJour = {
  /** Date ISO courte : "2026-08-14". */
  jour: string;
  /** Jour abrégé français façon Carbon : "jeu.". */
  nom_jour: string;
  ventes: number;
  vues: number;
  locations: number;
};

/** Relation `description` d'un véhicule : c'est elle qui porte marque, modèle et année, jamais `vehicules`. */
export type DescriptionVehicule = {
  marque: string;
  modele: string;
  annee: number;
};

/** Ligne du top 5 : le back ne sélectionne que ces colonnes (`get([...])`, ligne 93). */
export type VehiculeTopVues = {
  /** UUID : le modèle Vehicules utilise HasUuids (ligne 13), jamais un entier auto-incrémenté. */
  id: string;
  post_type: PostTypeVehicule;
  /** En FCFA. Laravel sérialise les `decimal` en STRING : "4500000", pas 4500000. */
  prix: string;
  statut: StatutVehicule;
  views_count: number;
  description: DescriptionVehicule | null;
  /**
   * Chargées par le `with(['description', 'photos'])` de la requête. Le
   * `get(['id', ...])` qui suit restreint les colonnes de `vehicules`, pas les
   * relations : `id` étant sélectionné, Eloquent sait résoudre les deux.
   */
  photos: PhotoVehicule[];
};

/** Réponse complète de `GET /api/stats/mes-stats`, champ `data`. */
export type StatsVendeur = {
  stats: CompteursVendeur;
  stats_mensuel: PointMois[];
  stats_semaine: PointJour[];
  /** Clé en ANGLAIS côté back ("vehicle", pas "vehicule") : VendeurStatsController.php:90. Ne pas « corriger » ici, ça casserait le branchement. */
  top_vehicule_vues: {
    my_top_vehicle_most_vues: VehiculeTopVues[];
  };
  rdv: {
    total_rdv: number;
  };
};

/* ────────────────────────────────────────────────────────────────────────────
   STATS CLIENT — AUCUN ENDPOINT N'EXISTE
   `mesStats` est réservé aux vendeurs. Ce type n'est donc PAS une réponse
   d'API : c'est une projection que le front calcule à partir de
   `transactions-conclues/mes-demandes`. D'où le nom `ProjectionClient` et non
   `StatsClient` — le nommage doit dire d'où vient la donnée.

   Ne PAS y remettre de compteurs de favoris, d'alertes, de rendez-vous ou de
   messages : ces quatre-là ont leurs propres pages, où le nombre est visible
   dans la liste elle-même. Le répéter sur le profil, c'est deux endroits à
   tenir à jour pour la même information.
   ──────────────────────────────────────────────────────────────────────────── */

/** Les 3 compteurs du profil client, tous dérivés des transactions CONFIRMÉES. */
export type ProjectionClient = {
  /** `mes-demandes` → statut "confirmé" ET type "vente". Un achat non confirmé n'est pas un achat. */
  nb_achats: number;
  /** `mes-demandes` → statut "confirmé" ET type "location". */
  nb_locations: number;
  /**
   * Somme des `prix_final` des VENTES confirmées uniquement. Les locations en
   * sont exclues volontairement : leur `prix_final` est un tarif journalier, et
   * l'additionner à un prix d'achat produirait un total sans signification.
   */
  total_depense: number;
};

/**
 * Ce qui attend le client, affiché en haut de son profil. Union discriminée sur
 * `type` : chaque branche porte SES champs, impossible de lire `expires_at` sur un rdv.
 */
export type ProchaineEcheance =
  | {
      type: "rdv";
      /** UUID : RendezVous utilise HasUuids (ligne 12). */
      id: string;
      /** ISO 8601 complet, `rendez_vous.date_heure` est casté en datetime côté Laravel. */
      date_heure: string;
      /** `rendez_vous.type` : les 3 valeurs du modèle. */
      nature: "visite" | "essai_routier" | "premiere_rencontre";
      lieu: string | null;
      vehicule_libelle: string;
    }
  | {
      type: "transaction";
      /** UUID : TransactionConclue utilise HasUuids (ligne 12). */
      id: string;
      /** `transactions_conclues.expires_at` : passé cette date, la transaction tombe en "expiré". */
      expires_at: string;
      /** Laravel sérialise `decimal` en string, comme `prix` plus haut. */
      prix_final: string;
      vehicule_libelle: string;
    };

/* ────────────────────────────────────────────────────────────────────────────
   TRANSACTIONS CONCLUES — les véhicules réellement achetés, loués ou vendus
   Un SEUL modèle sert les deux camps :
     client  → GET /api/transactions-conclues/mes-demandes    (relation `vendeur` chargée)
     vendeur → GET /api/transactions-conclues/mes-transactions (relation `client`  chargée)
   Attention au préfixe de route : `transactions-conclues`, pas `transactions`.
   ──────────────────────────────────────────────────────────────────────────── */

/** Les 4 valeurs de `transactions_conclues.statut` (constantes du modèle, lignes 31-34). */
export type StatutTransaction = "en_attente" | "confirmé" | "expiré" | "refusé";

/** Une ligne de `vehicules_photos`. `path` est relatif au disque de stockage Laravel. */
export type PhotoVehicule = {
  id: string;
  path: string;
  is_primary: boolean;
  position: number;
};

/** Le véhicule tel qu'il arrive dans une transaction : `description` et `photos` chargées en eager. */
export type VehiculeTransaction = {
  id: string;
  post_type: PostTypeVehicule;
  statut: StatutVehicule;
  prix: string;
  description: DescriptionVehicule | null;
  photos: PhotoVehicule[];
};

/** Les 3 colonnes que le back charge partout où il attache un utilisateur à autre chose. */
export type UtilisateurResume = Pick<User, "id" | "fullname" | "avatar">;

/** L'autre partie : le vendeur vu du client, le client vu du vendeur. */
export type ContrepartieTransaction = UtilisateurResume;

/**
 * Une transaction conclue. `vendeur` et `client` sont tous deux optionnels parce
 * qu'une seule des deux relations est chargée selon l'endpoint appelé — c'est le
 * composant d'affichage qui décide laquelle il regarde, via sa prop `perspective`.
 */
/* ────────────────────────────────────────────────────────────────────────────
   FAVORIS — GET /api/favoris (FavoriController::index)
   `Favori::with(['vehicule.description', 'vehicule.photos'])` sans restriction
   de colonnes : le véhicule arrive ENTIER, pas réduit comme dans le top 5.
   Aucun filtre sur le statut non plus — un favori vendu ou réservé reste dans
   la liste. C'est voulu : l'acheteur doit apprendre que le marché a bougé.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * La relation `description` au complet. `with('description')` charge TOUTES les
 * colonnes ; `DescriptionVehicule` n'en déclare que les trois dont se servent le
 * top 5 et les transactions. Ce type-ci ajoute celles que la fiche favori affiche.
 * Toutes nullable : la migration les déclare `->nullable()`.
 */
export type DescriptionVehiculeDetaillee = DescriptionVehicule & {
  kilometrage: number | null;
  /** Chaîne libre de 100 caractères en base, pas un enum : "Essence", "Diesel", "Hybride"… */
  carburant: string | null;
  transmission: string | null;
  carrosserie: string | null;
};

/** Les 3 valeurs possibles pour un papier (visite technique, carte grise, assurance). Accent inclus, comme en base. */
export type StatutDocument = "à_jour" | "expirée" | "non_concerné";

/** `vehicules_description.historique_accidents` : une tranche, jamais un détail chiffré. */
export type HistoriqueAccidents =
  | "aucun"
  | "quelques_accidents"
  | "nombreux_accidents";

/**
 * Les colonnes de `vehicules_description` que SEULE la fiche véhicule montre —
 * pas la carte catalogue, pas la carte favori. Un palier de plus au-dessus de
 * `DescriptionVehiculeDetaillee`, pour ne pas forcer tous les autres mocks
 * (catalogue, favoris, messagerie) à connaître des champs dont ils ne se
 * servent pas. Toutes nullable, comme le reste : `->nullable()` en migration.
 */
export type DescriptionVehiculeFiche = DescriptionVehiculeDetaillee & {
  couleur: string | null;
  nombre_portes: number | null;
  nombre_places: number | null;
  visite_technique: StatutDocument | null;
  date_visite_technique: string | null;
  carte_grise: StatutDocument | null;
  date_carte_grise: string | null;
  assurance: StatutDocument | null;
  historique_accidents: HistoriqueAccidents | null;
  /** `json` casté en array côté Laravel. Liste libre : "Climatisation", "GPS", "Caméra de recul"… */
  equipements: string[] | null;
};

/** Le véhicule tel qu'Eloquent le sérialise sans `get([...])` : toutes les colonnes. */
export type VehiculeComplet = {
  id: string;
  created_by: string;
  post_type: PostTypeVehicule;
  type: TypeVehicule;
  statut: StatutVehicule;
  /** Cast `decimal:2` : Laravel renvoie "6250000.00", avec les deux décimales. */
  prix: string;
  /** Prix estimé par Gemini à la validation. Null tant qu'aucune analyse n'a abouti. */
  prix_suggere: string | null;
  negociable: boolean;
  date_disponibilite: string | null;
  status_validation: StatutValidation;
  views_count: number;
  created_at: string;
  description: DescriptionVehiculeDetaillee | null;
  photos: PhotoVehicule[];
};

/* ────────────────────────────────────────────────────────────────────────────
   CATALOGUE — GET /api/vehicules (VehiculesController::index), route PUBLIQUE
   La méthode n'accepte AUCUN paramètre : ni filtre, ni tri, ni recherche, ni
   pagination. Elle fait un `->get()` et renvoie tout le catalogue validé et
   disponible d'un bloc. Tout le tri et le filtrage se font donc côté client.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Le vendeur attaché à une annonce. Le back charge `creator:id,fullname,email,role`
 * — `email` est volontairement ABSENT de ce type : la route est publique, et
 * l'afficher contredirait la promesse « votre numéro reste privé » de l'accueil.
 * Ne pas le déclarer ici, c'est se rendre incapable de le rendre par accident.
 */
export type CreateurVehicule = Pick<User, "id" | "fullname" | "role">;

/** Un véhicule du catalogue : le modèle complet, plus son vendeur. */
export type VehiculeCatalogue = VehiculeComplet & {
  creator: CreateurVehicule;
};

/* ────────────────────────────────────────────────────────────────────────────
   FICHE VÉHICULE — GET /api/vehicules/{id} (VehiculesController::vehicule), route PUBLIQUE
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Le vendeur tel que CETTE route le charge : `creator:id,fullname,email`.
 *
 * ⚠️ Pas `role`, contrairement à `CreateurVehicule` (index/populaires chargent
 * `role` mais pas `email` ; cette route fait l'inverse). Un `creator.role` ici
 * vaudrait `undefined` à l'exécution alors que TypeScript le dirait présent —
 * ne pas réutiliser `CreateurVehicule` sur la fiche pour cette raison.
 */
export type CreateurVehiculeFiche = Pick<User, "id" | "fullname" | "email">;

/**
 * Un véhicule tel que renvoyé par la fiche : le modèle complet, plus son
 * vendeur (sans rôle) et une `description` enrichie des champs propres à la
 * fiche (voir `DescriptionVehiculeFiche`) — `Omit` puis réécriture, plutôt
 * qu'un `&`, parce que `VehiculeComplet.description` est déjà typée en
 * `DescriptionVehiculeDetaillee | null` et qu'une intersection des deux
 * élargirait le type au lieu de le préciser.
 */
export type VehiculeFiche = Omit<VehiculeComplet, "description"> & {
  creator: CreateurVehiculeFiche;
  description: DescriptionVehiculeFiche | null;
};

/**
 * Compteurs renvoyés à côté de la liste.
 *
 * ⚠️ Ils ne comptent PAS la même chose que `vehicules` : les trois passent par
 * le scope `validee()` sans filtrer sur `statut`, ils incluent donc les véhicules
 * vendus et loués, que la liste exclut. `total_vehicules` sera toujours supérieur
 * à `vehicules.length`. Ne jamais l'afficher comme « N véhicules disponibles ».
 */
export type StatsCatalogue = {
  total_vehicules: number;
  en_vente: number;
  en_location: number;
};

/**
 * Champ `data` de la réponse — QUAND il y a des résultats.
 *
 * ⚠️ Le contrôleur renvoie `data: []` (un tableau nu) sur catalogue vide, et
 * `data: { vehicules, statsVehicules }` sinon. La forme change avec le contenu :
 * un `data.vehicules.map()` naïf plante sur une base fraîchement installée.
 * C'est au client de normaliser tant que le back n'est pas corrigé.
 */
export type ReponseCatalogue = {
  vehicules: VehiculeCatalogue[];
  statsVehicules: StatsCatalogue;
};

/** Une ligne de `favoris`, véhicule inclus. */
export type Favori = {
  id: string;
  user_id: string;
  vehicule_id: string;
  /**
   * Jamais null : la colonne porte un `->useCurrent()` en base
   * (2026_02_22_000001_create_favoris_table.php), alors même que
   * `FavoriController::store()` ne la renseigne pas à la création.
   */
  date_ajout: string;
  created_at: string;
  vehicule: VehiculeComplet;
};

export type TransactionConclue = {
  id: string;
  /** Décide du statut final du véhicule : "vente" → vendu, "location" → loué (contrôleur, ligne 298). */
  type: PostTypeVehicule;
  statut: StatutTransaction;
  /** En FCFA, sérialisé en STRING comme tous les `decimal` de Laravel. */
  prix_final: string;
  /** Renseignées par le client à la confirmation, et UNIQUEMENT si `type === "location"`. */
  date_debut_location: string | null;
  date_fin_location: string | null;
  confirme_par_vendeur: boolean;
  confirme_par_client: boolean;
  /** ISO 8601. Sert de date de la transaction à l'affichage. */
  created_at: string;
  vehicule: VehiculeTransaction;
  vendeur?: ContrepartieTransaction;
  client?: ContrepartieTransaction;
};

/* ────────────────────────────────────────────────────────────────────────────
   RENDEZ-VOUS — GET /api/rdv/mes-rdv (RendezVousController::mesRdv)
   Triés par `date_heure` DESC côté back : les plus lointains d'abord, à venir
   et passés mêlés dans un seul flux. La page les re-partitionne.
   ──────────────────────────────────────────────────────────────────────────── */

/** Les 3 valeurs de `rendez_vous.type` (constantes du modèle, lignes 31-33). */
export type TypeRendezVous = "visite" | "essai_routier" | "premiere_rencontre";

/** Les 5 valeurs de `rendez_vous.statut` (lignes 35-39). Noter les accents : "confirmé", pas "confirme". */
export type StatutRendezVous =
  | "en_attente"
  | "confirmé"
  | "refusé"
  | "annulé"
  | "terminé";

/** Un rendez-vous vu du côté client. La relation chargée est `vendeur`, jamais `client`. */
export type RendezVousClient = {
  id: string;
  client_id: string;
  vendeur_id: string;
  vehicule_id: string;
  /** ISO 8601. Casté en datetime côté Laravel. */
  date_heure: string;
  type: TypeRendezVous;
  statut: StatutRendezVous;
  /** Motif de l'annulation, saisi au moment d'annuler. Null tant que le RDV tient. */
  motif: string | null;
  lieu: string | null;
  notes: string | null;
  created_at: string;
  vendeur: UtilisateurResume;
  vehicule: VehiculeTransaction;
  /**
   * Champ CALCULÉ, ajouté à la volée par `mesRdv()` — il n'existe pas en base.
   *
   * ⚠️ Il vaut vrai dès que le client a noté CE VENDEUR, pas ce rendez-vous :
   * le back interroge `Avis` sur le couple (client_id, vendeur_id). Deux RDV
   * terminés avec le même vendeur passent donc tous les deux à `true` après un
   * seul avis, et `AvisController::store()` répond 409 sur le second.
   */
  has_avis: boolean;
};

/* ────────────────────────────────────────────────────────────────────────────
   MESSAGERIE — ConversationController (routes/api.php lignes 146-154)
   Une conversation est la clé unique (participant_1, participant_2, vehicule_id) :
   elle est TOUJOURS adossée à un véhicule, on n'en ouvre jamais « dans le vide ».

   ⚠️ Ces trois endpoints renvoient leur charge utile À LA RACINE
   (`{ success, conversations }`, `{ success, messages }`), pas sous `data`
   comme le reste de l'API. C'est l'exception du fichier.
   ──────────────────────────────────────────────────────────────────────────── */

/** Un participant tel que le back le charge partout ici : `select('id','fullname','avatar','role')`. */
export type ParticipantConversation = UtilisateurResume & { role: RoleUser };

/** Une ligne de `messages`, avec son expéditeur chargé en eager (`with('sender:...')`). */
export type MessageChat = {
  /** UUID : le modèle Messages utilise HasUuids. */
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  /** Casté en boolean côté modèle. Passe à true dès que le destinataire ouvre le fil. */
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender: ParticipantConversation;
};

/**
 * L'aperçu attaché à chaque conversation par `index()`.
 *
 * ⚠️ TROIS champs, pas un de plus : le back fait
 * `->select('content', 'created_at', 'sender_id')` (ConversationController:79).
 * Ni `id`, ni `read_at`, ni `sender`. Les déclarer ici rendrait compilable un
 * `last_message.read_at` qui vaudrait `undefined` à l'exécution.
 */
export type DernierMessage = {
  content: string;
  created_at: string;
  /** Comparé à l'id de l'utilisateur courant pour préfixer l'aperçu par « Vous : ». */
  sender_id: string;
};

/** Une entrée de `GET /conversations`, enrichie à la main par le contrôleur. */
export type Conversation = {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  vehicule_id: string;
  /** Null tant qu'aucun message n'a été envoyé : `findOrCreate` ne la renseigne pas. */
  last_message_at: string | null;
  created_at: string;
  /**
   * Produit par le `withCount(['messages as unread_count'])`, filtré sur
   * `sender_id != moi` et `read_at IS NULL`. Ne compte donc QUE les messages reçus.
   *
   * ⚠️ Il devient périmé dès l'ouverture du fil : `messages()` marque comme lu
   * en effet de bord côté serveur (lignes 172-178) sans que ce nombre-ci bouge.
   * C'est au client de le remettre à 0 localement.
   */
  unread_count: number;
  /** L'autre participant, résolu par comparaison de `participant_1_id` avec le mien. */
  other_participant: ParticipantConversation;
  last_message: DernierMessage | null;
  /** `with(['vehicule.description', 'vehicule.photos'])` sans restriction : le modèle entier. */
  vehicule: VehiculeComplet;
};

/* ────────────────────────────────────────────────────────────────────────────
   NOTIFICATIONS — GET /api/notifications/mes-notifs (NotificationsController)
     GET  /notifications/mes-notifs   → { success, data: { notifications, unread_count } }
     POST /notifications/{id}/read    → { success, message }
     POST /notifications/read-all     → { success, message }

   ⚠️ Ici la charge utile EST sous `data`, contrairement à la messagerie qui la
   met à la racine. Les deux conventions coexistent dans l'API, il faut vérifier
   au cas par cas.

   ⚠️ Aucune pagination : `index()` fait un `->get()` sur tout l'historique de
   l'utilisateur, y compris les notifications lues d'il y a six mois.

   ⚠️ `markAsRead` et `markAsAllRead` ne renvoient PAS la notification modifiée,
   seulement un message. Le front doit mettre son état à jour lui-même.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Les valeurs acceptées par la colonne `notifications.type`.
 *
 * ⚠️ NEUF valeurs en base, mais seulement HUIT constantes dans le modèle :
 * `abonnement` reste dans le CHECK de la migration alors que les abonnements
 * ont été supprimés (commit cdb70b2). Aucun code n'en crée plus, mais les
 * lignes historiques en portent encore. L'omettre ici ferait planter tout
 * `Record<TypeNotification, …>` exhaustif sur une base de production.
 */
export type TypeNotification =
  | "rdv"
  | "formation"
  | "alerte_vehicule"
  | "moderation"
  | "transaction"
  | "support"
  | "tendance"
  | "reservation"
  /** Hérité. Plus jamais produit — à traiter en repli, pas à afficher. */
  | "abonnement";

/**
 * Gravité, qui décide de la couleur d'affichage.
 * Colonne ajoutée après coup (migration `2026_06_08_215955_add_level`) et
 * `->nullable()` : les notifications antérieures, et celles de `notifyAdmins()`
 * qui ne le renseigne pas, arrivent avec `level: null`. Prévoir un défaut.
 */
export type NiveauNotification = "success" | "warning" | "error" | "info";

/**
 * Le sac de données joint à la notification (`json` casté en `array`).
 *
 * Volontairement non typé finement : chaque site de création y met ses propres
 * clés, et un type par variante mentirait au premier ajout côté back. Les
 * formes observées aujourd'hui, par `type` :
 *   rdv             → { rdv_id }
 *   transaction     → { transaction_id }
 *   moderation      → { signalement_id, action_cible? }
 *   support         → { ticket_id }
 *   formation       → { inscription_id, formation_id }
 *   tendance        → { vehicule_id | formation_id, nb_vues | nb_inscrits, tranche, periode }
 * Narrower au point d'usage (`data?.rdv_id as string | undefined`), pas ici.
 */
export type DonneesNotification = Record<string, unknown> | null;

/** Une ligne de `notifications`. Le modèle utilise HasUuids et SoftDeletes. */
export type Notification = {
  id: string;
  user_id: string;
  type: TypeNotification;
  title: string;
  message: string;
  level: NiveauNotification | null;
  data: DonneesNotification;

  lu: boolean;
  is_read: boolean;
  /** Null tant que la notification n'a pas été lue. */
  lu_at: string | null;
  /** `->useCurrent()` en base : jamais null en pratique. */
  date_envoi: string;
  /** C'est sur `created_at` que le back trie (DESC), pas sur `date_envoi`. */
  created_at: string;
  updated_at: string;
  /** SoftDeletes. Non null seulement si la ligne a été supprimée en douceur. */
  deleted_at: string | null;
};

/** Champ `data` de `GET /api/notifications/mes-notifs`. */
export type ReponseNotifications = {
  notifications: Notification[];
  /** Recompté côté serveur via le scope `unread()`, pas déduit de la liste. */
  unread_count: number;
};

/** Corps de `POST /api/avis` (AvisController::store, lignes 17-21). */
export type NouvelAvis = {
  rdv_id: string;
  /** Entier de 1 à 5, validé côté back. */
  note: number;
  /** 1000 caractères maximum. */
  commentaire?: string;
};

/* ────────────────────────────────────────────────────────────────────────────
   ADMIN — routes/api.php lignes 231-260, toutes derrière `role:admin`.
   Un véhicule vu par l'admin est un `VehiculeCatalogue` : même forme exacte
   (`AdminController::vehicules()` charge `creator:id,fullname,role`, comme le
   catalogue public), SAUF que `statut`/`status_validation` peuvent y prendre
   n'importe laquelle de leurs valeurs — l'admin voit aussi le suspendu, le
   banni, l'en_attente. Pas de nouveau type : `VehiculeCatalogue` suffit.
   ──────────────────────────────────────────────────────────────────────────── */

/** Les 3 valeurs de `signalements.statut` (constantes du modèle, lignes 28-30). Accents inclus, comme en base. */
export type StatutSignalement = "en_attente" | "traité" | "rejeté";

/** Un point de `inscriptions_par_mois` : `AdminController::stats()`, ligne 468-473. */
export type PointInscriptionMois = {
  /** "2026-03", format `DATE_FORMAT(..., '%Y-%m')` — pas de `nom_mois` ici, contrairement à `PointMois`. */
  mois: string;
  total: number;
};

/** Une ligne de `transactions` dans `stats()` : `groupBy('type','statut')`, ligne 485-487. */
export type PointTransactionAdmin = {
  type: PostTypeVehicule;
  statut: StatutTransaction;
  total: number;
};

/**
 * Champ `data` de `GET /admin/stats` (AdminController::stats(), lignes 452-540).
 *
 * ⚠️ Chaque `Record` partiel vient d'un `->pluck('total', 'clé')` Laravel : la
 * clé n'existe QUE si au moins une ligne l'a en base. Un `stats.vehicules_validation.rejetee`
 * sur un catalogue sans rejet vaut `undefined`, pas `0` — toujours lire avec
 * `?? 0`, jamais supposer la clé présente.
 *
 * Delibérément un sous-ensemble : `statsMarche()` et `statsGeographie()`
 * (comportement acheteurs, répartition géographique) sont deux endpoints à
 * part, pour une page d'analyse dédiée — pas le dashboard d'accueil.
 */
export type StatsAdmin = {
  /** Jamais la clé "admin" : la requête back filtre `whereIn('role', [client, vendeur, concessionnaire, auto_ecole])`. */
  users_par_role: Partial<Record<Exclude<RoleUser, "admin">, number>>;
  users_par_statut: Partial<Record<StatutUser, number>>;
  inscriptions_par_mois: PointInscriptionMois[];
  vehicules_validation: Partial<Record<StatutValidation, number>>;
  vehicules_statut: Partial<Record<StatutVehicule, number>>;
  transactions: PointTransactionAdmin[];
  /** Somme des `prix_final` des ventes confirmées. Déjà un entier côté back (`(int) $caVentes`). */
  ca_ventes: number;
  signalements_statut: Partial<Record<StatutSignalement, number>>;
  /** Jamais "client" ni "vendeur" : filtré sur `[concessionnaire, auto_ecole]`. */
  partenaires_par_type: Partial<Record<"concessionnaire" | "auto_ecole", number>>;
};
