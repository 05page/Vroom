# Référence API — Vroom / MoveCi

Carte complète des **124 endpoints** exposés par `vroom-backend`.
Toutes les URI sont préfixées par `/api` (ex. `POST /login` → `POST /api/login`).

> Source de vérité : [`routes/api.php`](../vroom-backend/routes/api.php).
> Pour régénérer la liste brute : `php artisan route:list --path=api`

## Légende des accès

| Symbole | Signification |
|---|---|
| 🌐 | **Public** — aucun token requis |
| 🔑 | `auth:sanctum` seul (sans `check.statut`) |
| 🔒 | `auth:sanctum` + `check.statut` — un compte suspendu/banni est rejeté |
| 🏪 | 🔒 + `role:vendeur,concessionnaire,auto_ecole` |
| 🎓 | 🔒 + `role:auto_ecole` |
| 👑 | 🔒 + `role:admin` |

> ⚠️ `🏪` couvre **trois** rôles. Il n'existe pas de rôle `partenaire` en base — `concessionnaire` et `auto_ecole` sont stockés tels quels dans `users.role`.

---

## 1. Authentification & compte

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🌐 | GET | `/auth/{provider}/redirect` | `AuthController@redirect` | Démarre l'OAuth (Google) — redirige vers le provider |
| 🌐 | GET | `/auth/{provider}/callback` | `AuthController@callback` | Retour OAuth : crée/met à jour le User, génère un token, redirige vers le front |
| 🌐 | POST | `/auth/exchange` | `AuthController@exchangeCode` | Échange un code OAuth temporaire contre le vrai token Sanctum. **Usage unique** (`Cache::pull`) |
| 🌐 | POST | `/login` | `AuthController@login` | Connexion email/mot de passe. **403 si `statut !== actif`** |
| 🌐 | POST | `/register` | `AuthController@register` | Inscription classique |
| 🌐 | POST | `/forgot-password` | `PasswordResetController@sendResetLink` | Envoi du lien de reset. Réponse **identique** que le compte existe ou non (anti-énumération) |
| 🌐 | POST | `/reset-password` | `PasswordResetController@resetPassword` | Vérifie le token, change le mdp, **révoque tous les tokens Sanctum** |
| 🔑 | GET | `/me` | `AuthController@getInfoUser` | Profil du connecté. **Volontairement hors `check.statut`** : un banni doit pouvoir lire son statut |
| 🔒 | POST | `/auth/complete-onboarding` | `AuthController@completeOnboarding` | Finalise l'onboarding (rôle + champs métier) et pose `onboarding_completed_at` |
| 🔒 | PUT | `/me/update` | `AuthController@update` | Mise à jour du profil |
| 🔒 | PUT | `/me/contact` | `AuthController@updatePhoneAndAddress` | Téléphone + adresse |
| 🔒 | PUT | `/me/change-password` | `AuthController@changePassword` | Changement de mot de passe (connecté) |
| 🔒 | POST | `/me/avatar` | `AuthController@avatarProfile` | Upload photo de profil |
| 🔒 | POST | `/me/cover-photo` | `AuthController@coverProfile` | Upload photo de couverture |
| 🔒 | POST | `/logout` | `AuthController@logout` | Révoque le token courant |

## 2. Véhicules

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🌐 | GET | `/vehicules` | `VehiculesController@index` | Catalogue public (véhicules validés) |
| 🌐 | GET | `/vehicules/populaires` | `VehiculesController@populaires` | Les 3 véhicules validés les plus consultés (accueil) |
| 🌐 | GET | `/vehicules/{id}` | `VehiculesController@vehicule` | Détail public. **`{id}` contraint au format UUID** par `->where()` |
| 🔒 | GET | `/vehicules/suggestions` | `VehiculesController@suggestions` | Suggestions à partir des favoris ; fallback sur les plus vus si aucun favori |
| 🏪 | GET | `/vehicules/mes-vehicules` | `VehiculesController@mesVehicules` | Annonces du vendeur connecté |
| 🏪 | GET | `/vehicules/mon-vehicule/{id}` | `VehiculesController@monVehicule` | Détail d'une **de ses** annonces (tous statuts) |
| 🏪 | POST | `/vehicules/post-vehicule` | `VehiculesController@postVehicules` | Création d'annonce → déclenche la modération Gemini |
| 🏪 | PUT | `/vehicules/{id}` | `VehiculesController@updateVehicule` | Modification |
| 🏪 | DELETE | `/vehicules/{id}` | `VehiculesController@deleteVehicule` | Suppression (soft delete) |

> **Pourquoi l'UUID est contraint sur la route publique** : sans le `->where()`, l'URL `/vehicules/mes-vehicules` serait capturée par `/vehicules/{id}`. C'est documenté dans `api.php` — ne retire pas cette contrainte.

## 3. Favoris, alertes, signalements

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🔒 | GET | `/favoris` | `FavoriController@index` | Favoris du connecté |
| 🔒 | POST | `/favoris/{vehiculeId}` | `FavoriController@store` | Ajouter aux favoris |
| 🔒 | DELETE | `/favoris/{vehiculeId}` | `FavoriController@destroy` | Retirer des favoris |
| 🔒 | GET | `/alertes` | `AlerteController@index` | Alertes de recherche du connecté |
| 🔒 | POST | `/alertes` | `AlerteController@store` | Créer une alerte |
| 🔒 | PUT | `/alertes/{id}` | `AlerteController@update` | Modifier une alerte |
| 🔒 | DELETE | `/alertes/{id}` | `AlerteController@destroy` | Supprimer une alerte |
| 🔒 | POST | `/signalements` | `SignalementController@store` | Signaler un user ou un véhicule |
| 🔒 | GET | `/signalements/mes-signalements` | `SignalementController@mesSignalements` | Ses propres signalements |

> `Favori`, `Alerte` et `Signalement` sont **trois modèles distincts**, sans discriminateur `type` partagé.

## 4. Rendez-vous

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🔒 | GET | `/rdv/mes-rdv` | `RendezVousController@mesRdv` | Côté **client** : les RDV qu'il a demandés |
| 🔒 | POST | `/rdv` | `RendezVousController@store` | Client demande un RDV à l'auteur de l'annonce |
| 🔒 | POST | `/rdv/{id}/annuler` | `RendezVousController@annuler` | Annulation — **client ou vendeur** |
| 🏪 | GET | `/rdv/nos-rdv` | `RendezVousController@nosRdv` | Côté **vendeur** : les RDV reçus |
| 🏪 | POST | `/rdv/{id}/confirmer` | `RendezVousController@confirmer` | Le vendeur confirme (crée l'événement Google Calendar) |
| 🏪 | POST | `/rdv/{id}/refuser` | `RendezVousController@refuser` | Le vendeur refuse |
| 🏪 | POST | `/rdv/{id}/terminer` | `RendezVousController@terminer` | Le vendeur clôt le RDV — débloque le dépôt d'avis |

## 5. Transactions conclues (double confirmation)

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🔒 | GET | `/transactions-conclues/mes-demandes` | `TransactionConclueController@mesDemandes` | Transactions en attente **côté client** |
| 🔒 | POST | `/transactions-conclues/{id}/confirmer-client` | `@confirmerClient` | Le client confirme. Body : `{ code }` |
| 🔒 | POST | `/transactions-conclues/{id}/refuser` | `@refuserClient` | ⚠️ Le **client** refuse — voir l'avertissement ci-dessous |
| 🏪 | GET | `/transactions-conclues/mes-transactions` | `@mesTransactions` | Transactions **côté vendeur** |
| 🏪 | POST | `/transactions-conclues/{id}/confirmer-vendeur` | `@confirmerVendeur` | Le vendeur confirme. Body : `{ code, type, prix_final, date_debut_location?, date_fin_location? }` |
| 🏪 | POST | `/transactions-conclues/{id}/refuser-vendeur` | `@refuserVendeur` | Le vendeur refuse — incrémente `nb_refus_transaction` du vendeur |

> ⚠️ **Piège de nommage.** La confirmation est explicite des deux côtés (`confirmer-client` / `confirmer-vendeur`), mais le refus ne l'est que d'un seul : `/refuser` = **côté client**, `/refuser-vendeur` = côté vendeur. À harmoniser un jour en `refuser-client`.

> Rappel métier : c'est une confirmation mutuelle sur l'honneur. **Aucun paiement ne transite par la plateforme** (cf. [REGLES-METIER.md](REGLES-METIER.md)).

## 6. Réservations

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🔒 | GET | `/reservations` | `ReservationController@index` | Réservations du client connecté + infos véhicule |
| 🔒 | POST | `/reservations` | `ReservationController@store` | Créer une réservation |
| 🔒 | GET | `/reservations/{id}` | `ReservationController@show` | Détail (uniquement les siennes) |
| 🔒 | POST | `/reservations/{id}/cancel` | `ReservationController@cancel` | Annule, remet le véhicule `disponible`. **Après 2 annulations, le client est bloqué sur ce véhicule** |

## 7. Messagerie (Reverb / WebSocket)

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🔒 | GET | `/conversations` | `ConversationController@index` | Liste + dernier message + nb de non-lus |
| 🔒 | GET | `/conversations/unread-count` | `@unreadCount` | Total de messages non lus (badge du header) |
| 🔒 | POST | `/conversations` | `@findOrCreate` | Ouvre ou récupère une conversation. Contrainte UNIQUE `(p1, p2, vehicule_id)` en base contre les races |
| 🔒 | GET | `/conversations/{id}/messages` | `@messages` | Messages — **marque automatiquement les reçus comme lus** |
| 🔒 | POST | `/conversations/{id}/messages` | `@send` | Envoi — broadcast `MessageSent` via Reverb (`toOthers()`) |
| 🔒 | POST | `/conversations/{id}/read` | `@markAsRead` | Marque lu sans charger les messages |
| 🔒 | DELETE | `/conversations/{id}/messages/{messageId}` | `@destroyMessage` | Supprime un message (vérifie appartenance + participation) |

## 8. Formations & inscriptions (auto-école)

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🔒 | GET | `/formations` | `FormationController@index` | Catalogue public des formations **validées** |
| 🔒 | GET | `/formations/{id}` | `FormationController@show` | Détail d'une formation |
| 🔒 | GET | `/formations/mes-inscriptions` | `InscriptionFormationController@mesInscriptions` | Côté **élève** : ses inscriptions |
| 🔒 | POST | `/formations/{id}/inscrire` | `InscriptionFormationController@store` | L'élève s'inscrit |
| 🔒 | DELETE | `/formations/{id}/inscrire` | `InscriptionFormationController@destroy` | L'élève se désinscrit (seulement si `statut = inscrit`) |
| 🎓 | GET | `/formations/mes-formations` | `@mesFormations` | Formations de l'auto-école connectée |
| 🎓 | GET | `/formations/mes-inscrits` | `@mesInscrits` | Tous ses élèves + type de permis choisi |
| 🎓 | GET | `/formations/mes-stats` | `@mesStats` | Stats globales, toutes formations confondues |
| 🎓 | POST | `/formations` | `@store` | Créer une formation (→ modération admin) |
| 🎓 | PUT | `/formations/{id}` | `@update` | Modifier |
| 🎓 | DELETE | `/formations/{id}` | `@destroy` | Supprimer |
| 🎓 | GET | `/formations/{id}/inscrits` | `@inscrits` | Inscrits d'une formation |
| 🎓 | GET | `/formations/{id}/stats` | `@stats` | Nb inscrits, répartition par statut, taux de réussite calculé en live |
| 🎓 | PUT | `/formations/{formationId}/inscrits/{inscriptionId}` | `@updateInscrit` | Body : `{ statut_eleve, date_examen?, reussite? }` |
| 🎓 | GET | `/formations/{formationId}/inscrits/{inscriptionId}/versements` | `VersementInscriptionController@index` | Versements + total payé |
| 🎓 | POST | `/formations/{formationId}/inscrits/{inscriptionId}/versements` | `@store` | Enregistrer un versement |
| 🎓 | DELETE | `/formations/{formationId}/inscrits/{inscriptionId}/versements/{versId}` | `@destroy` | Supprimer un versement |

> **Ordre des routes critique** : les routes littérales (`mes-formations`, `mes-inscrits`, `mes-stats`) sont déclarées **avant** `/{id}`. Si tu ajoutes une route littérale sous `/formations`, place-la avant la ligne `Route::get('/{id}', …)` — sinon Laravel la capturera comme un id.

## 9. CRM vendeur

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🏪 | GET | `/crm/clients` | `CrmController@clients` | Clients + stats rapides (nb rdv, nb transactions, dernière interaction) |
| 🏪 | GET | `/crm/clients/{clientId}` | `@clientDetail` | Fiche complète : infos + RDV + transactions + notes |
| 🏪 | POST | `/crm/clients/{clientId}/notes` | `@storeNote` | Ajouter une note privée |
| 🏪 | PUT | `/crm/notes/{noteId}` | `@updateNote` | Modifier une note |
| 🏪 | DELETE | `/crm/notes/{noteId}` | `@destroyNote` | Supprimer une note |

## 10. Abonnements

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🏪 | GET | `/abonnements/plans` | `AbonnementController@plans` | Plans disponibles, **filtrés selon le rôle** du connecté |
| 🏪 | GET | `/abonnements/mon-abonnement` | `@monAbonnement` | Abonnement actif + son plan |
| 🏪 | POST | `/abonnements/souscrire` | `@souscrire` | Body : `{ plan_id, periodicite: "mensuel"\|"annuel" }` |
| 🏪 | POST | `/abonnements/resilier` | `@resilier` | Résilie l'abonnement actif |

> Le controller reçoit un `PaymentGatewayInterface` par injection — c'est le seul point d'entrée paiement du backend.

## 11. Notifications, géolocalisation, divers

| | Méthode | URI | Action | Description |
|---|---|---|---|---|
| 🔒 | GET | `/notifications/mes-notifs` | `NotificationsController@index` | Notifications du connecté |
| 🔒 | POST | `/notifications/{id}/read` | `@markAsRead` | Marquer une notification lue |
| 🔒 | POST | `/notifications/read-all` | `@markAsAllRead` | Tout marquer lu |
| 🌐 | GET | `/geo/proches` | `GeolocalisationController@proches` | Acteurs proches. Query : `rayon` (km, défaut 20), `role` (optionnel) |
| 🔒 | POST | `/geo/position` | `@updatePosition` | Met à jour les coordonnées GPS (position navigateur) |
| 🔒 | POST | `/geo/geocode` | `@geocodeAdresse` | Géocode une adresse via **Nominatim** et met à jour les coordonnées |
| 🔒 | GET | `/tendances` | `TendancesController@index` | Agrégats plateforme ou auto-école |
| 🌐 | GET | `/avis/vendeur/{id}` | `AvisController@avisVendeur` | Avis publics d'un vendeur |
| 🔒 | POST | `/avis` | `AvisController@store` | Déposer un avis — **uniquement après un RDV terminé** |
| 🌐 | GET | `/users/{id}/profil` | `VendeurStatsController@profil` | Profil public vendeur/concessionnaire/auto-école |
| 🏪 | GET | `/stats/mes-stats` | `VendeurStatsController@mesStats` | Statistiques du vendeur connecté |
| 🔒 | GET | `/support/mes-tickets` | `SupportController@mesTickets` | Ses tickets, du plus récent au plus ancien |
| 🔒 | POST | `/support/post-tickets` | `SupportController@store` | Créer un ticket |

## 12. Admin

> Tous ces endpoints sont sous `role:admin` + préfixe `/admin`.
> **26 des 124 routes vivent dans `AdminController`** — c'est le fichier le plus chargé du projet.

### Comptes

| Méthode | URI | Action | Description |
|---|---|---|---|
| GET | `/admin/admins` | `@admins` | Liste des comptes administrateurs |
| POST | `/admin/admins` | `@createAdmin` | Créer un admin (réservé aux admins connectés) |
| GET | `/admin/users` | `@users` | Liste des utilisateurs |
| POST | `/admin/users/{id}/suspendre` | `@suspendre` | Suspendre un compte |
| POST | `/admin/users/{id}/bannir` | `@bannir` | Bannir un compte |
| POST | `/admin/users/{id}/restaurer` | `@restaurer` | Repasser le compte en `actif` |
| POST | `/admin/users/{id}/valider` | `@validerCompte` | Valider un concessionnaire / auto-école `en_attente` |

### Véhicules (modération)

| Méthode | URI | Action | Description |
|---|---|---|---|
| GET | `/admin/vehicules` | `@vehicules` | Tous les véhicules, tous statuts confondus |
| GET | `/admin/vehicules/en-attente` | `@vehiculesEnAttente` | File de modération |
| POST | `/admin/vehicules/{id}/valider` | `@validerVehicule` | `status_validation` → `validee` |
| POST | `/admin/vehicules/{id}/rejeter` | `@rejeterVehicule` | → `rejetee` |
| POST | `/admin/vehicules/{id}/suspendre` | `@suspendreVehicule` | → `suspendu` |
| DELETE | `/admin/vehicules/{id}` | `@supprimerVehicule` | Soft delete |
| GET | `/admin/vehicules/corbeille` | `@corbeille` | Véhicules soft-deletés |
| POST | `/admin/vehicules/{id}/restaurer` | `@restaurerVehicule` | Restaure depuis la corbeille |
| DELETE | `/admin/vehicules/{id}/forcer` | `@forcerSupprimerVehicule` | **`forceDelete()` — irréversible** |

### Formations, signalements, support

| Méthode | URI | Action | Description |
|---|---|---|---|
| GET | `/admin/formations` | `@formations` | Filtre `statut_validation` : `en_attente\|validé\|rejeté` |
| POST | `/admin/formations/{id}/valider` | `@validerFormation` | Rend la formation visible au catalogue public |
| POST | `/admin/formations/{id}/rejeter` | `@rejeterFormation` | **Motif obligatoire**, stocké dans les détails du log |
| GET | `/admin/signalements` | `@signalements` | Liste des signalements |
| POST | `/admin/signalements/{id}/traiter` | `@traiterSignalement` | Traiter un signalement |
| GET | `/admin/support` | `SupportController@index` | Tous les tickets. Filtre : `?statut=ouvert` |
| POST | `/admin/support/{id}/repondre` | `SupportController@repondre` | Répond, met à jour le statut, notifie l'utilisateur |

### Statistiques & journal

| Méthode | URI | Action | Description |
|---|---|---|---|
| GET | `/admin/stats` | `@stats` | Dashboard global : users, véhicules, transactions, signalements |
| GET | `/admin/stats/marche` | `@statsMarche` | Comportement acheteurs : marques/modèles favoris, carburant, prix, conversion RDV |
| GET | `/admin/stats/geographie` | `@statsGeographie` | Répartition par commune (extraite du champ `adresse`) |
| GET | `/admin/logs` | `@logs` | Journal de modération (`LogModeration`) |
| GET | `/admin/transactions` | `@transactions` | Vue globale. Filtres : `statut`, `type`, `vendeur_id` |

---

## Incohérences connues (dette assumée)

Rien de bloquant, mais à connaître pour ne pas se tromper d'URL :

| Sujet | Constat |
|---|---|
| **Création de ressource** | Trois styles : `POST /formations` (REST), `POST /vehicules/post-vehicule` et `POST /support/post-tickets` (verbe dans l'URL) |
| **Refus de transaction** | `/refuser` = client (implicite) vs `/refuser-vendeur` = vendeur (explicite) — asymétrique |
| **Doublon véhicule** | `GET /vehicules/{id}` (public) et `GET /vehicules/mon-vehicule/{id}` (propriétaire) : deux endpoints, même ressource |
| **Abréviations** | `mes-notifs` (partout ailleurs : `mes-<ressource>` en entier), `rdv` vs `reservations` |
| **`AdminController`** | 26 routes dans un seul fichier — candidat naturel à un découpage (`AdminUserController`, `AdminVehiculeController`, `AdminStatsController`…) |

## Pièges à ne pas réintroduire

1. **Ordre des routes** : toute route littérale (`/mes-truc`) doit être déclarée **avant** la route `{id}` du même préfixe. Concerné : `vehicules`, `formations`, `transactions-conclues`.
2. **Contrainte UUID** sur `GET /vehicules/{id}` — la retirer casserait `/vehicules/mes-vehicules`.
3. **`/me` est hors `check.statut`** volontairement : un compte banni doit pouvoir lire son propre statut pour que le front l'aiguille vers `/compte-bloque`.

## Couverture de tests

5 fichiers de tests réels pour 124 endpoints :

| Fichier | Périmètre |
|---|---|
| `tests/Feature/AuthTest.php` | Authentification |
| `tests/Feature/PermissionsTest.php` | Middleware de rôles |
| `tests/Feature/RendezVousTest.php` | Cycle de vie des RDV |
| `tests/Feature/TransactionConclueTest.php` | Double confirmation |
| `tests/Feature/VehiculeWorkflowTest.php` | Workflow `status_validation` |

Non couverts : messagerie, formations/versements, CRM, abonnements, réservations, l'intégralité de l'espace admin.
