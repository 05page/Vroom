# Documentation Backend — Vroom

> Stack : **Laravel 12** · **PHP 8.2+** · **PostgreSQL** · **Laravel Sanctum** · **Laravel Reverb**
> Répertoire : `vroom-backend/`

---

## Sommaire

1. [Démarrage rapide](#1-démarrage-rapide)
2. [Structure des dossiers](#2-structure-des-dossiers)
3. [Authentification (Sanctum + OAuth)](#3-authentification-sanctum--oauth)
4. [Routes API](#4-routes-api)
5. [Middlewares](#5-middlewares)
6. [Modèles & base de données](#6-modèles--base-de-données)
7. [Controllers — rôle de chacun](#7-controllers--rôle-de-chacun)
8. [Système de notifications](#8-système-de-notifications)
9. [Temps réel avec Reverb](#9-temps-réel-avec-reverb)
10. [Tâches planifiées (Scheduler)](#10-tâches-planifiées-scheduler)
11. [Migrations — ordre et contenu](#11-migrations--ordre-et-contenu)
12. [Variables d'environnement](#12-variables-denvironnement)
13. [Erreurs fréquentes et solutions](#13-erreurs-fréquentes-et-solutions)

---

## 1. Démarrage rapide

```bash
cd vroom-backend
composer install                  # installer les dépendances PHP
php artisan serve                 # lancer sur http://localhost:8000
php artisan migrate               # appliquer les migrations
php artisan migrate:fresh --seed  # repartir de zéro avec des données de test
php artisan test                  # lancer tous les tests
php artisan reverb:start          # lancer le serveur WebSocket (temps réel)
```

---

## 2. Structure des dossiers

```
vroom-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/         # Logique de chaque endpoint
│   │   └── Middleware/          # Gardes d'accès (rôle, auth)
│   ├── Models/                  # Modèles Eloquent (une classe = une table)
│   ├── Events/                  # Événements broadcast (temps réel)
│   ├── Jobs/                    # Tâches en arrière-plan
│   ├── Providers/
│   │   └── AppServiceProvider.php  # Enregistrement des services
│   └── Services/                # Services métier (Gemini, GoogleCalendar...)
│
├── bootstrap/
│   └── app.php                  # Configuration centrale de Laravel
│
├── database/
│   ├── migrations/              # Toutes les migrations (structure DB)
│   └── seeders/                 # Données de test
│
└── routes/
    ├── api.php                  # ← Toutes les routes de l'API
    └── channels.php             # Canaux WebSocket autorisés
```

---

## 3. Authentification (Sanctum + OAuth)

### Flow complet

```
Utilisateur clique "Google"
        ↓
GET /api/auth/google/redirect
        ↓
Google OAuth (hors app)
        ↓
GET /api/auth/google/callback
  → Crée ou met à jour le User en base
  → Génère un token Sanctum
  → Redirige vers : http://localhost:3000/api/auth/callback?token={token}&role={role}&data={user}
        ↓
Frontend stocke le token dans un cookie httpOnly "auth_token"
        ↓
Chaque requête API inclut : Authorization: Bearer {token}
```

### Token Sanctum

- Stocké dans la table `personal_access_tokens`
- Passé dans le header HTTP `Authorization: Bearer ...`
- Toutes les routes sous `middleware('auth:sanctum')` nécessitent ce token

### Connexion par email/mot de passe

```
POST /api/login   → { email, password }
POST /api/register → { fullname, email, password, role }
POST /api/logout  → révoque le token courant
```

---

## 4. Routes API

Toutes les routes sont dans `routes/api.php`.

### Routes publiques (sans connexion)

```
GET  /geo/proches                  → vendeurs/partenaires proches (géolocalisation)
GET  /auth/google/redirect         → démarrer OAuth Google
GET  /auth/google/callback         → retour OAuth Google
POST /login                        → connexion email/mdp
POST /register                     → inscription
GET  /avis/vendeur/{id}            → avis publics d'un vendeur
GET  /vehicules                    → catalogue public
GET  /vehicules/{uuid}             → détail d'un véhicule
```

> **Note :** La route `/vehicules/{id}` utilise une contrainte regex pour n'accepter que des UUID valides, afin d'éviter les conflits avec `/vehicules/mes-vehicules` etc.

### Routes authentifiées (auth:sanctum)

Structure générale :
```
GET  /me                    → profil de l'user connecté
PUT  /me/update             → modifier nom, rôle, etc.
PUT  /me/contact            → modifier téléphone, adresse
POST /logout                → déconnexion

# Véhicules
GET  /vehicules/suggestions          → suggestions basées sur les favoris
GET  /vehicules/mes-vehicules        → annonces du vendeur connecté [role: vendeur]
POST /vehicules/post-vehicule        → publier une annonce [role: vendeur]
PUT  /vehicules/{id}                 → modifier une annonce [role: vendeur]
DELETE /vehicules/{id}               → supprimer une annonce [role: vendeur]

# Notifications
GET  /notifications/mes-notifs
POST /notifications/{id}/read
POST /notifications/read-all

# Favoris
GET    /favoris
POST   /favoris/{vehiculeId}
DELETE /favoris/{vehiculeId}

# Alertes
GET    /alertes
POST   /alertes
PUT    /alertes/{id}
DELETE /alertes/{id}

# Rendez-vous
GET  /rdv/mes-rdv                    → RDV du client
POST /rdv                            → créer un RDV
POST /rdv/{id}/annuler               → annuler un RDV
GET  /rdv/nos-rdv                    → RDV du vendeur [role: vendeur]
POST /rdv/{id}/confirmer             → confirmer [role: vendeur]
POST /rdv/{id}/refuser               → refuser [role: vendeur]
POST /rdv/{id}/terminer              → marquer terminé [role: vendeur]

# Messagerie
GET  /conversations                          → liste des conversations
POST /conversations                          → créer/récupérer une conversation
GET  /conversations/{id}/messages            → messages d'une conversation
POST /conversations/{id}/messages            → envoyer un message
POST /conversations/{id}/read                → marquer comme lu
DELETE /conversations/{id}/messages/{msgId} → supprimer un message

# Formations
GET  /formations                             → catalogue public validé
GET  /formations/mes-inscriptions            → inscriptions du client
GET  /formations/{id}                        → détail formation
POST /formations/{id}/inscrire               → s'inscrire
DELETE /formations/{id}/inscrire             → annuler inscription
GET  /formations/mes-formations              → formations de l'auto-école [role: auto_ecole]
POST /formations                             → créer formation [role: auto_ecole]
PUT  /formations/{id}                        → modifier formation [role: auto_ecole]
DELETE /formations/{id}                      → supprimer formation [role: auto_ecole]
GET  /formations/{id}/inscrits               → liste inscrits [role: auto_ecole]
PUT  /formations/{formationId}/inscrits/{inscriptionId} → changer statut élève

# Transactions conclues
GET  /transactions-conclues/mes-demandes     → côté client
POST /transactions-conclues/{id}/confirmer-client
POST /transactions-conclues/{id}/refuser
GET  /transactions-conclues/mes-transactions → côté vendeur [role: vendeur]
POST /transactions-conclues/{id}/confirmer-vendeur

# CRM
GET  /crm/clients                            → [role: vendeur]
GET  /crm/clients/{clientId}
POST /crm/clients/{clientId}/notes
PUT  /crm/notes/{noteId}
DELETE /crm/notes/{noteId}

# Support
GET  /support/mes-tickets
POST /support

# Stats vendeur
GET  /stats/mes-stats                        → [role: vendeur]

# Abonnements
GET  /abonnements/plans                      → [role: vendeur]
GET  /abonnements/mon-abonnement
POST /abonnements/souscrire
POST /abonnements/resilier
```

### Routes admin (`/admin/*`, role: admin)

```
GET  /admin/admins
POST /admin/admins
GET  /admin/users
POST /admin/users/{id}/suspendre
POST /admin/users/{id}/bannir
POST /admin/users/{id}/restaurer
POST /admin/users/{id}/valider
GET  /admin/vehicules
GET  /admin/vehicules/en-attente
POST /admin/vehicules/{id}/valider
POST /admin/vehicules/{id}/rejeter
GET  /admin/signalements
POST /admin/signalements/{id}/traiter
GET  /admin/stats
GET  /admin/stats/marche              → données comportementales acheteurs
GET  /admin/stats/geographie          → répartition géographique
GET  /admin/logs
GET  /admin/transactions
GET  /admin/formations
POST /admin/formations/{id}/valider
POST /admin/formations/{id}/rejeter
GET  /admin/support
POST /admin/support/{id}/repondre
```

### Routes versements (formations)

```
GET    /formations/{id}/inscrits/{inscriptionId}/versements        → liste versements + totaux
POST   /formations/{id}/inscrits/{inscriptionId}/versements        → ajouter un versement
DELETE /formations/{id}/inscrits/{inscriptionId}/versements/{vid}  → supprimer un versement
```

### Comment ajouter une nouvelle route

1. Ouvrir `routes/api.php`
2. Choisir le bon groupe de middleware (`auth:sanctum`, `role:vendeur`, etc.)
3. Ajouter la route dans le bon `prefix()->group()`
4. Créer le controller si nécessaire : `php artisan make:controller NomController`

```php
// Exemple dans routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('mon-module')->group(function () {
        Route::get('/', [MonController::class, 'index']);
        Route::post('/', [MonController::class, 'store']);
    });
});
```

---

## 5. Middlewares

### `auth:sanctum`
Vérifie que la requête contient un token valide dans le header `Authorization: Bearer ...`.
Retourne **401** si le token est absent ou invalide.

### `role:{roles}`
Défini dans `app/Http/Middleware/RoleMiddleware.php`.
Vérifie que `Auth::user()->role` est dans la liste des rôles autorisés.
Retourne **403** si le rôle ne correspond pas.

```php
// Exemple d'utilisation dans api.php
Route::middleware('role:vendeur,concessionnaire')->group(function () {
    // Accessible uniquement aux vendeurs et concessionnaires
});
```

---

## 6. Modèles & base de données

### User — `app/Models/User.php`

Table : `users`

**Champs importants :**
```
id, fullname, email, password
role : client | vendeur | concessionnaire | auto_ecole | admin
statut : actif | suspendu | banni | en_attente
partenaire_type : concessionnaire | auto_ecole | null
raison_sociale, rccm, numero_agrement  (pour les partenaires)
google_id, avatar                       (OAuth Google)
latitude, longitude, adresse            (géolocalisation)
taux_reussite                           (auto-calculé pour auto-écoles)
```

**Scopes utiles :**
```php
User::clients()         // WHERE role = 'client'
User::vendeurs()        // WHERE role = 'vendeur'
User::partenaires()     // WHERE role IN ('concessionnaire', 'auto_ecole')
User::admins()          // WHERE role = 'admin'
User::actifs()          // WHERE statut = 'actif'
User::enAttente()       // WHERE statut = 'en_attente'
```

---

### Vehicules — `app/Models/Vehicules.php`

Table : `vehicules`

**Champs importants :**
```
id (UUID), created_by (FK → users.id)
post_type : vente | location
type : neuf | occasion
statut : disponible | vendu | loué | suspendu | banni
status_validation : en_attente | validee | rejetee
prix, prix_suggere (IA Gemini), negociable
date_disponibilite
```

**Constantes :**
```php
Vehicules::STATUS_VENDU       // 'vendu'
Vehicules::STATUS_LOUE        // 'loué'
Vehicules::STATUS_DISPONIBLE  // 'disponible'
Vehicules::POST_TYPE_VENTE    // 'vente'
Vehicules::POST_TYPE_LOCATION // 'location'
```

**Relations :**
```php
$vehicule->creator          // User (vendeur/partenaire)
$vehicule->description      // VehiculesDescription
$vehicule->photos           // Collection<VehiculesPhotos>
$vehicule->favoris          // Collection<Favori>
$vehicule->rendezVous       // Collection<RendezVous>
```

**Event automatique :**
Quand `status_validation` passe à `'validee'` ou `'restauree'`, l'événement `VehiculeValidated` est dispatché automatiquement (notifie le créateur, met à jour les alertes matching).

---

### RendezVous — `app/Models/RendezVous.php`

Table : `rendez_vous`

**Statuts possibles et transitions :**
```
en_attente → confirmé  (via confirmer())
en_attente → refusé    (via refuser())
confirmé   → terminé   (via terminer())
*          → annulé    (via annuler())
```

**Méthodes :**
```php
$rdv->confirmer()   // statut → 'confirmé'
$rdv->refuser()     // statut → 'refusé'
$rdv->annuler()     // statut → 'annulé'
$rdv->terminer()    // statut → 'terminé'
```

**Types de RDV :** `visite`, `essai_routier`, `premiere_rencontre`

---

### TransactionConclue — `app/Models/TransactionConclue.php`

Table : `transactions_conclues`

Une transaction est créée quand un RDV passe à `'terminé'`. Elle nécessite une **double confirmation** (vendeur + client) pour être finalisée.

**Flow :**
```
RDV terminé
     ↓
TransactionConclue créée (statut: en_attente, code_confirmation généré)
     ↓
Vendeur confirme → POST /transactions-conclues/{id}/confirmer-vendeur
     ↓
Client confirme avec le code → POST /transactions-conclues/{id}/confirmer-client
     ↓
statut: confirmé → véhicule marqué vendu/loué
```

**Méthodes :**
```php
$tx->genererCode()        // génère un code 6 chiffres unique
$tx->isCodeValide($code)  // vérifie le code + non expiré
$tx->isDoubleConfirme()   // true si les deux ont confirmé
```

---

### Conversation + Messages

Tables : `conversations`, `messages`

**Règle métier :** Une conversation est **toujours liée à un véhicule** (`vehicule_id` obligatoire).

```php
// Trouver ou créer une conversation
$conversation = Conversation::where(function($q) use ($userId, $otherId) {
    $q->where('participant_1_id', $userId)->where('participant_2_id', $otherId);
})->orWhere(function($q) use ($userId, $otherId) {
    $q->where('participant_1_id', $otherId)->where('participant_2_id', $userId);
})->where('vehicule_id', $vehiculeId)->first();
```

**Scope :**
```php
Conversation::forUser($userId) // conversations où l'user est participant
```

---

### Notifications — `app/Models/Notifications.php`

Table : `notifications`

**Types disponibles (constantes) :**
```php
Notifications::TYPE_RDV           // 'rdv'
Notifications::TYPE_FORMATION     // 'formation'
Notifications::TYPE_ALERTE        // 'alerte_vehicule'
Notifications::TYPE_ABONNEMENT    // 'abonnement'
Notifications::TYPE_MODERATION    // 'moderation'
Notifications::TYPE_TRANSACTION   // 'transaction'
Notifications::TYPE_SUPPORT       // 'support'
Notifications::TYPE_TENDANCE      // 'tendance' — pic de vues/préinscriptions détecté par le scheduler
```

**Comportement automatique :**
À chaque création d'une notification, l'événement `NotificationBroadcast` est dispatché via Reverb (WebSocket) pour notifier le frontend en temps réel.

**Méthodes :**
```php
$notif->markAsRead()    // is_read → true
$notif->isRead()        // bool
$notif->isUnread()      // bool
```

**Scopes :**
```php
Notifications::forUser($userId)->unread()->recent()->get()
```

---

### Signalement — `app/Models/Signalement.php`

Table : `signalements`

Un signalement peut cibler **soit un user** (`cible_user_id`), **soit un véhicule** (`cible_vehicule_id`), jamais les deux.

**Statuts :** `en_attente` → `traité` ou `rejeté`

**Méthodes :**
```php
$signalement->traiter($admin, $actionCible, $noteAdmin)
$signalement->rejeter($admin, $noteAdmin)
```

---

### Formation — `app/Models/Formation.php`

Table : `formations`

- Créée par une auto-école
- Doit être validée par un admin avant d'apparaître dans le catalogue
- **Statuts validation :** `en_attente` → `validé` | `rejeté`
- **Types de permis :** `A`, `A2`, `B`, `B1`, `C`, `D`

**Relation inscription :**
```php
$formation->inscriptions   // Collection<InscriptionFormation>
$inscription->statut_eleve // inscrit | en_cours | examen_passe | terminé | abandonné
$inscription->reussite     // true | false | null (null = pas encore d'examen)
```

---

### LogModeration — `app/Models/LogModeration.php`

Table : `logs_moderation`

Journal immuable de toutes les actions d'un admin. **Pas de soft delete.**

**Utilisation :**
```php
LogModeration::enregistrer(
    $admin,           // User admin
    'valider_vehicule',
    'vehicule',
    $vehicule->id,
    ['description' => 'Annonce validée']
);
```

---

## 7. Controllers — rôle de chacun

| Controller | Responsabilité |
|------------|---------------|
| `AuthController` | Login, register, OAuth Google, `/me`, logout |
| `VehiculesController` | CRUD annonces + catalogue public + suggestions |
| `RendezVousController` | CRUD RDV + confirmer/refuser/terminer |
| `ConversationController` | Messagerie (conversations + messages) |
| `FormationController` | CRUD formations + stats auto-école |
| `InscriptionFormationController` | Inscription/désincription élèves |
| `TransactionConclueController` | Double confirmation vente/location après RDV |
| `NotificationsController` | Lecture + marquage notifications |
| `FavoriController` | Gestion favoris |
| `AlerteController` | Gestion alertes de recherche |
| `AvisController` | Avis sur vendeurs |
| `SignalementController` | Soumettre un signalement |
| `CrmController` | CRM vendeur (liste clients + notes) |
| `VendeurStatsController` | Stats du vendeur connecté |
| `AbonnementController` | Plans + souscription |
| `SupportController` | Tickets de support (user + admin) |
| `AdminController` | Toutes les actions admin (users, véhicules, stats...) |
| `GeolocalisationController` | Vendeurs proches + mise à jour position |
| `TendancesController` | Tendances du marché (agrégats) |
| `VersementInscriptionController` | Versements de paiement d'une inscription formation |

### Structure type d'un Controller

```php
class MonController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $items = MonModel::where('user_id', $user->id)
            ->with('relation')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'champ'  => 'required|string|max:255',
            'autre'  => 'nullable|integer|min:1',
        ]);

        $item = MonModel::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Créé avec succès',
        ], 201);
    }
}
```

---

## 8. Système de notifications

### Créer une notification

```php
use App\Models\Notifications;

Notifications::create([
    'user_id' => $destinataire->id,
    'type'    => Notifications::TYPE_RDV,    // utiliser toujours les constantes
    'title'   => 'Rendez-vous confirmé',
    'message' => 'Votre RDV du 15 avril a été confirmé.',
    'data'    => json_encode(['rdv_id' => $rdv->id]),
]);
// → déclenche automatiquement NotificationBroadcast via Reverb
```

### Ajouter un nouveau type de notification

1. Ajouter la constante dans `Notifications.php` :
```php
const TYPE_MON_TYPE = 'mon_type';
```

2. Créer une migration pour ajouter la valeur dans la contrainte PostgreSQL :
```php
// Dans une nouvelle migration
DB::statement("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('rdv', 'formation', 'alerte_vehicule', 'abonnement', 'moderation', 'transaction', 'support', 'mon_type'))");
```

> **Attention PostgreSQL :** Les contraintes CHECK ne s'auto-modifient pas. Il faut toujours créer une migration quand on ajoute une valeur à une enum ou un CHECK.

---

## 9. Temps réel avec Reverb

### Lancer Reverb
```bash
php artisan reverb:start   # port 8080 par défaut
```

### Événements disponibles

| Event | Canal | Déclencheur |
|-------|-------|-------------|
| `NotificationBroadcast` | `private-user.{userId}` | Création d'une `Notification` |
| `MessageSent` | `private-conversation.{id}` | Envoi d'un message |
| `MessageDeleted` | `private-conversation.{id}` | Suppression d'un message |
| `VehiculeValidated` | `private-user.{creatorId}` | Véhicule validé par admin |

### Créer un nouvel événement

```php
// app/Events/MonEvenement.php
class MonEvenement implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public array $data) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("user.{$this->data['user_id']}")];
    }

    public function broadcastAs(): string
    {
        return 'MonEvenement'; // nom côté frontend Pusher
    }
}

// Dispatch depuis un Controller ou un Model
event(new MonEvenement(['user_id' => $userId, 'info' => '...']));
```

### Canaux autorisés — `routes/channels.php`

```php
// Canal privé par user (notifications)
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Canal conversation
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conv = Conversation::find($conversationId);
    return $conv && ($conv->participant_1_id == $user->id || $conv->participant_2_id == $user->id);
});
```

### DataRefresh — rafraîchissement ciblé

En plus des événements métier, chaque action importante dispatche un `DataRefresh` pour forcer un refetch côté frontend sans rechargement de page.

```php
event(new DataRefresh($userId, 'rdv'));         // rafraîchit les RDV
event(new DataRefresh($userId, 'vehicule'));    // rafraîchit les véhicules
event(new DataRefresh($userId, 'formation'));   // rafraîchit les formations
event(new DataRefresh($userId, 'transaction')); // rafraîchit les transactions
```

Le frontend écoute via le hook `useDataRefresh(type, callback)`.

---

## 10. Tâches planifiées (Scheduler)

### Lancer le scheduler

```bash
# En développement — tourne en boucle et exécute les tâches à l'heure prévue
php artisan schedule:work

# En production — ajouter cette ligne au crontab du serveur
* * * * * cd /path/to/vroom-backend && php artisan schedule:run >> /dev/null 2>&1
```

### Tâches enregistrées — `routes/console.php`

| Commande | Fréquence | Rôle |
|----------|-----------|------|
| `tendances:check` | toutes les heures | Détecte les pics de vues/préinscriptions et notifie les propriétaires |

### `tendances:check` — détail

Scanne tous les véhicules actifs et formations validées. Compare les comptages sur la période en cours (jour / semaine) avec des seuils fixes. Si un seuil est franchi **pour la première fois** sur la période, envoie une notification `TYPE_TENDANCE`.

**Seuils véhicules (vues) :**
```
Quotidien   : 20 → 50 → 100
Hebdomadaire: 100 → 300 → 500
```

**Seuils formations (préinscriptions) :**
```
Quotidien   : 5 → 10 → 20
Hebdomadaire: 15 → 30 → 50
```

**Anti-spam — table `alertes_tendance` :**
Avant d'envoyer, on vérifie si une entrée `(vehicule_id|formation_id, tranche, periode)` existe depuis le début de la période courante (minuit pour quotidien, lundi pour hebdomadaire). Si oui, on skip. Sinon, on notifie et on crée l'entrée.

**Reset automatique :**
- Quotidien → à chaque nouveau jour (startOfDay)
- Hebdomadaire → à chaque nouveau lundi (startOfWeek)
Pas de job de nettoyage nécessaire — la logique repose sur `notified_at >= debut_periode`.

### Ajouter une nouvelle tâche planifiée

```php
// Dans routes/console.php
Schedule::command('ma-commande:nom')->daily();
Schedule::command('ma-commande:nom')->hourly();
Schedule::command('ma-commande:nom')->weeklyOn(1, '00:00'); // lundi minuit
```

Créer la commande :
```bash
php artisan make:command MaCommande
# → crée app/Console/Commands/MaCommande.php
```

---

## 11. Migrations — ordre et contenu

Les migrations sont dans `database/migrations/`. Laravel les exécute dans l'ordre alphabétique du nom de fichier (qui commence par une date).

### Tables principales et leur ordre de création

```
users                           (0001_01_01_000000)
personal_access_tokens          (2025_12_15)
catalogues                      (2025_12_16)
vehicules                       (2025_12_17)
vehicules_description           (2025_12_17)
vehicules_photos                (2025_12_17)
notifications                   (2025_12_24)
favoris, alertes, avis          (2026_02_22)
rendez_vous                     (2026_02_22)
formations, descriptions, inscriptions (2026_02_22)
plans_abonnement, abonnements   (2026_02_22)
signalements, logs_moderation   (2026_02_22)
vehicule_vues                   (2026_02_22)
messages                        (2026_02_22)
conversations                   (2026_03_13)
transactions_conclues           (2026_03_19)
crm_notes                       (2026_03_19)
support_tickets                 (2026_03_20)
versements_inscription          (2026_03_21)
alertes_tendance                (2026_03_21)
```

### Ajouter une migration

```bash
php artisan make:migration add_mon_champ_to_users_table
```

**Convention de nommage :**
- `create_xxx_table` → crée une nouvelle table
- `add_xxx_to_yyy_table` → ajoute colonnes à une table existante
- `modify_xxx_in_yyy_table` → modifie une colonne existante

### Modifier une contrainte CHECK PostgreSQL

PostgreSQL ne permet pas de modifier une contrainte en place. Il faut la supprimer et la recréer :

```php
public function up(): void
{
    DB::statement("ALTER TABLE ma_table DROP CONSTRAINT IF EXISTS ma_table_colonne_check");
    DB::statement("ALTER TABLE ma_table ADD CONSTRAINT ma_table_colonne_check
        CHECK (colonne IN ('valeur1', 'valeur2', 'nouvelle_valeur'))");
}

public function down(): void
{
    DB::statement("ALTER TABLE ma_table DROP CONSTRAINT IF EXISTS ma_table_colonne_check");
    DB::statement("ALTER TABLE ma_table ADD CONSTRAINT ma_table_colonne_check
        CHECK (colonne IN ('valeur1', 'valeur2'))");
}
```

---

## 11. Variables d'environnement

Fichier `vroom-backend/.env` (non versionné — copier `.env.example` et compléter) :

```env
APP_NAME=Vroom
APP_ENV=local
APP_KEY=base64:...             # généré par php artisan key:generate
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=vroom
DB_USERNAME=postgres
DB_PASSWORD=...

# Frontend (pour les redirections OAuth)
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Google Gemini (suggestions de prix IA)
GEMINI_API_KEY=...

# Google Calendar (création d'événements RDV)
GOOGLE_CALENDAR_ID=...

# WebSocket Reverb
REVERB_APP_ID=vroom
REVERB_APP_KEY=vroom-key
REVERB_APP_SECRET=...
REVERB_HOST=localhost
REVERB_PORT=8080

# Broadcast
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database
```

---

## 12. Erreurs fréquentes et solutions

### Erreur 500 sur une route qui existait avant

**Vérifier dans l'ordre :**
1. Les logs Laravel : `storage/logs/laravel.log`
2. La requête SQL : est-ce qu'une relation ou un champ est manquant ?
3. Une contrainte PostgreSQL est-elle violée ? (valeur hors du CHECK)

---

### "SQLSTATE: check constraint violation"

**Cause :** On essaie d'insérer une valeur qui n'est pas dans la contrainte CHECK de la colonne (ex: un nouveau type de notification, une nouvelle valeur d'enum).

**Solution :** Créer une migration pour mettre à jour le CHECK (voir section 10).

---

### Route retourne 404

**Causes fréquentes :**
1. La route n'est pas dans `routes/api.php`
2. Un conflit d'ordre entre routes statiques et routes dynamiques. Laravel lit les routes de haut en bas → une route `/{id}` peut "capturer" `mes-vehicules` si elle est définie avant.

**Solution :** Toujours définir les routes statiques **avant** les routes dynamiques dans un même groupe :
```php
Route::get('/mes-vehicules', ...);      // ← statique d'abord
Route::get('/{id}', ...);               // ← dynamique ensuite
```

---

### Route retourne 403

**Cause :** Le middleware `role:...` bloque l'accès.

**Vérifier :** Le rôle de l'user en base correspond-il aux rôles autorisés dans la route ?

---

### Les notifications ne s'envoient pas en temps réel

**Vérifier :**
1. Reverb tourne : `php artisan reverb:start`
2. Le canal de broadcast correspond à ce que le frontend écoute
3. `BROADCAST_CONNECTION=reverb` dans `.env`
4. `QUEUE_CONNECTION=database` + un worker tourne : `php artisan queue:work`

---

### `Auth::user()` retourne `null` dans un Controller

**Cause :** La route n'est pas dans le groupe `middleware('auth:sanctum')`.

**Vérifier** que la route est bien imbriquée dans le groupe approprié dans `api.php`.

---

### Gemini / Google Calendar ne fonctionne pas

**Causes :**
- Clé API manquante dans `.env`
- Quota API dépassé
- Le Job correspondant n'est pas dans la queue

**Solution :** Lancer le worker de queue :
```bash
php artisan queue:work
```

---

### Les notifications de tendance ne s'envoient pas

**Vérifier :**
1. Le scheduler tourne : `php artisan schedule:work` (dev) ou crontab en prod
2. La commande s'exécute manuellement : `php artisan tendances:check`
3. La table `alertes_tendance` n'a pas d'entrée bloquante depuis le début de la période
4. Les véhicules ont bien `status_validation = 'validee'` et `statut = 'disponible'`
5. Les formations ont bien `statut_validation = 'validé'`

---

*Dernière mise à jour : Mars 2026*
