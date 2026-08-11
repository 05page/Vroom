# Modules & pages à créer — cartographie page → endpoint

> **Source de vérité : `vroom-backend/routes/api.php`** (lu le 2026-08-11).
> 125 routes actives. Toute page listée ici existe parce qu'un endpoint la justifie ;
> tout endpoint doit être consommé par au moins une page.
>
> Complément de [`ARCHITECTURE.md`](ARCHITECTURE.md) : ce document dit **quoi** construire,
> `ARCHITECTURE.md` dit **comment** (les 4 couches `schema → api → hook → page`).

## Légende des priorités

| | Signification |
|---|---|
| **P1** | Périmètre des 4 jours — voir `ARCHITECTURE.md` §6 |
| **P2** | Cœur produit, juste après les 4 jours |
| **P3** | Peut attendre — back-office, administration |

Les chemins `(public)`, `(client)`, `(pro)`, `(admin)` sont des **route groups** Next : ils portent un `layout.tsx` commun sans apparaître dans l'URL.

---

## 1. Public — visiteur non connecté

Aucun token. Ces pages doivent fonctionner déconnecté, c'est la vitrine.

| P | Page | Route Next | Endpoints backend |
|---|---|---|---|
| **P1** | Landing | `(public)/page.tsx` | `GET /vehicules/populaires` |
| **P1** | Catalogue | `(public)/vehicules/page.tsx` | `GET /vehicules` |
| **P1** | Fiche véhicule | `(public)/vehicules/[id]/page.tsx` | `GET /vehicules/{id}`<br>`GET /avis/vendeur/{id}`<br>`POST /favoris/{vehiculeId}` *(si connecté)*<br>`POST /rdv` *(si connecté)*<br>`POST /signalements` *(si connecté)* |
| P2 | Profil public vendeur | `(public)/vendeurs/[id]/page.tsx` | `GET /users/{id}/profil`<br>`GET /avis/vendeur/{id}` |
| P2 | Vendeurs proches (carte) | `(public)/vendeurs-proches/page.tsx` | `GET /geo/proches` |
| P3 | CGU | `(public)/cgu/page.tsx` | *aucun — contenu statique* |

**Attention sur la fiche véhicule :** `GET /vehicules/{id}` est contraint par `->where()` à n'accepter qu'un **UUID valide**. C'est volontaire — ça empêche `/vehicules/mes-vehicules` d'être capturé par la route publique. Ne construis pas d'URL de fiche avec autre chose qu'un UUID.

---

## 2. Authentification

| P | Page | Route Next | Endpoints backend |
|---|---|---|---|
| **P1** | Connexion | `(public)/connexion/page.tsx` | `POST /login`<br>`GET /auth/{provider}/redirect` *(bouton Google)* |
| **P1** | Inscription | `(public)/inscription/page.tsx` | `POST /register` |
| **P1** | Callback OAuth | `app/api/auth/callback/route.ts` | `POST /auth/exchange` |
| **P1** | Onboarding | `(public)/onboarding/page.tsx` | `POST /auth/complete-onboarding` |
| P2 | Mot de passe oublié | `(public)/mot-de-passe-oublie/page.tsx` | `POST /forgot-password` |
| P2 | Réinitialisation | `(public)/reinitialiser/page.tsx` | `POST /reset-password` |

**Flux Google :** le backend gère `redirect` puis `callback` et renvoie vers le frontend. Le frontend échange ensuite via `POST /auth/exchange`. `POST /auth/complete-onboarding` est un **endpoint unique** depuis le commit `235135a` — ne le redécoupe pas en plusieurs appels.

**`GET /me` est hors `check.statut`** (volontaire) : un utilisateur banni doit pouvoir récupérer son statut pour être redirigé vers `/compte-bloque`. Toutes les autres routes authentifiées le rejettent.

---

## 3. Compte — tous rôles connectés

| P | Page | Route Next | Endpoints backend |
|---|---|---|---|
| **P1** | *(hook global)* session | — | `GET /me`<br>`POST /logout` |
| P2 | Profil | `(compte)/profil/page.tsx` | `GET /me`<br>`PUT /me/update`<br>`PUT /me/contact`<br>`POST /me/avatar`<br>`POST /me/cover-photo` |
| P2 | Changer mot de passe | `(compte)/profil/mot-de-passe/page.tsx` | `PUT /me/change-password` |
| P2 | Notifications | `(compte)/notifications/page.tsx` | `GET /notifications/mes-notifs`<br>`POST /notifications/{id}/read`<br>`POST /notifications/read-all` |
| P2 | Messagerie | `(compte)/messages/page.tsx` | `GET /conversations`<br>`POST /conversations`<br>`GET /conversations/{id}/messages`<br>`POST /conversations/{id}/messages`<br>`POST /conversations/{id}/read`<br>`DELETE /conversations/{id}/messages/{messageId}` |
| P2 | *(badge header)* non lus | — | `GET /conversations/unread-count` |
| P3 | Support | `(compte)/support/page.tsx` | `GET /support/mes-tickets`<br>`POST /support/post-tickets` |
| P3 | Compte bloqué | `(public)/compte-bloque/page.tsx` | `GET /me` |

**`POST /geo/position`** n'appartient à aucune page : c'est un appel de fond, à déclencher depuis un hook une fois la géolocalisation navigateur autorisée.

---

## 4. Client — acheteur

| P | Page | Route Next | Endpoints backend |
|---|---|---|---|
| **P1** | Favoris | `(client)/favoris/page.tsx` | `GET /favoris`<br>`DELETE /favoris/{vehiculeId}` |
| P2 | Suggestions | `(client)/suggestions/page.tsx` | `GET /vehicules/suggestions` |
| P2 | Mes alertes | `(client)/alertes/page.tsx` | `GET /alertes`<br>`POST /alertes`<br>`PUT /alertes/{id}`<br>`DELETE /alertes/{id}` |
| P2 | Mes rendez-vous | `(client)/rdv/page.tsx` | `GET /rdv/mes-rdv`<br>`POST /rdv/{id}/annuler` |
| P2 | Mes réservations | `(client)/reservations/page.tsx` | `GET /reservations`<br>`POST /reservations`<br>`GET /reservations/{id}`<br>`POST /reservations/{id}/cancel` |
| P2 | Mes transactions | `(client)/transactions/page.tsx` | `GET /transactions-conclues/mes-demandes`<br>`POST /transactions-conclues/{id}/confirmer-client`<br>`POST /transactions-conclues/{id}/refuser` |
| P2 | Laisser un avis | *(modale sur RDV terminé)* | `POST /avis` |
| P3 | Mes signalements | `(client)/signalements/page.tsx` | `GET /signalements/mes-signalements` |

**Double confirmation :** une transaction n'est conclue que si **client ET vendeur** confirment chacun de leur côté (`confirmer-client` + `confirmer-vendeur`). L'UI doit montrer les deux états séparément — un seul « confirmé » ne suffit pas. Aucun argent ne transite par la plateforme, c'est une confirmation sur l'honneur (cf. `REGLES-METIER.md`).

---

## 5. Formations — côté client

| P | Page | Route Next | Endpoints backend |
|---|---|---|---|
| P2 | Catalogue formations | `(client)/formations/page.tsx` | `GET /formations` |
| P2 | Détail formation | `(client)/formations/[id]/page.tsx` | `GET /formations/{id}`<br>`POST /formations/{id}/inscrire`<br>`DELETE /formations/{id}/inscrire`<br>`POST /formations/{formationId}/promotions/valider` |
| P2 | Mes inscriptions | `(client)/formations/mes-inscriptions/page.tsx` | `GET /formations/mes-inscriptions` |

**`POST /formations/{id}/promotions/valider` est volontairement hors du groupe `role:auto_ecole`** — c'est le client qui saisit son code promo. Ne le range pas avec les routes de gestion des promos.

---

## 6. Pro — vendeur · concessionnaire · auto-école

Middleware backend : `role:vendeur,concessionnaire,auto_ecole`.

| P | Page | Route Next | Endpoints backend |
|---|---|---|---|
| P2 | Dashboard pro | `(pro)/dashboard/page.tsx` | `GET /stats/mes-stats` |
| P2 | Mes véhicules | `(pro)/vehicules/page.tsx` | `GET /vehicules/mes-vehicules`<br>`DELETE /vehicules/{id}` |
| P2 | Publier un véhicule | `(pro)/vehicules/nouveau/page.tsx` | `POST /vehicules/post-vehicule`<br>`POST /geo/geocode` |
| P2 | Éditer un véhicule | `(pro)/vehicules/[id]/page.tsx` | `GET /vehicules/mon-vehicule/{id}`<br>`PUT /vehicules/{id}` |
| P2 | Nos rendez-vous | `(pro)/rdv/page.tsx` | `GET /rdv/nos-rdv`<br>`POST /rdv/{id}/confirmer`<br>`POST /rdv/{id}/refuser`<br>`POST /rdv/{id}/terminer` |
| P2 | Nos transactions | `(pro)/transactions/page.tsx` | `GET /transactions-conclues/mes-transactions`<br>`POST /transactions-conclues/{id}/confirmer-vendeur`<br>`POST /transactions-conclues/{id}/refuser-vendeur` |
| P3 | CRM clients | `(pro)/crm/page.tsx` | `GET /crm/clients` |
| P3 | Fiche client CRM | `(pro)/crm/[clientId]/page.tsx` | `GET /crm/clients/{clientId}`<br>`POST /crm/clients/{clientId}/notes`<br>`PUT /crm/notes/{noteId}`<br>`DELETE /crm/notes/{noteId}` |
| P3 | Tendances marché | `(pro)/tendances/page.tsx` | `GET /tendances` |

**Publication de véhicule :** après `POST /vehicules/post-vehicule`, Gemini auto-modère l'annonce (`status_validation : en_attente → validee/rejetee`). L'UI ne doit **pas** afficher le véhicule comme publié immédiatement — il passe par `en_attente`.

---

## 7. Auto-école — formations

Middleware backend : `role:auto_ecole`.

| P | Page | Route Next | Endpoints backend |
|---|---|---|---|
| P3 | Mes formations | `(pro)/formations/page.tsx` | `GET /formations/mes-formations`<br>`POST /formations`<br>`PUT /formations/{id}`<br>`DELETE /formations/{id}` |
| P3 | Mes inscrits | `(pro)/formations/inscrits/page.tsx` | `GET /formations/mes-inscrits`<br>`GET /formations/{id}/inscrits`<br>`PUT /formations/{formationId}/inscrits/{inscriptionId}` |
| P3 | Versements d'un élève | `(pro)/formations/[id]/inscrits/[inscriptionId]/page.tsx` | `GET …/versements`<br>`POST …/versements`<br>`DELETE …/versements/{versId}` |
| P3 | Codes promo | `(pro)/formations/[id]/promotions/page.tsx` | `GET /formations/{formationId}/promotions`<br>`POST /formations/{formationId}/promotions`<br>`PUT …/promotions/{promotionId}`<br>`DELETE …/promotions/{promotionId}` |
| P3 | Stats formations | `(pro)/formations/stats/page.tsx` | `GET /formations/mes-stats`<br>`GET /formations/{id}/stats` |

**Ordre des routes :** le backend déclare `mes-formations`, `mes-inscrits`, `mes-stats` **avant** `/{id}` pour éviter que Laravel les capture comme UUID. Ce n'est pas une contrainte frontend, mais ça explique pourquoi ces chemins existent sous cette forme.

---

## 8. Admin

Middleware backend : `role:admin`, préfixe `/admin`.

| P | Page | Route Next | Endpoints backend |
|---|---|---|---|
| P3 | Dashboard admin | `(admin)/dashboard/page.tsx` | `GET /admin/stats` |
| P3 | Utilisateurs | `(admin)/users/page.tsx` | `GET /admin/users`<br>`POST /admin/users/{id}/suspendre`<br>`POST /admin/users/{id}/bannir`<br>`POST /admin/users/{id}/restaurer`<br>`POST /admin/users/{id}/valider` |
| P3 | Administrateurs | `(admin)/admins/page.tsx` | `GET /admin/admins`<br>`POST /admin/admins` |
| P3 | Modération véhicules | `(admin)/vehicules/page.tsx` | `GET /admin/vehicules`<br>`GET /admin/vehicules/en-attente`<br>`POST /admin/vehicules/{id}/valider`<br>`POST /admin/vehicules/{id}/rejeter`<br>`POST /admin/vehicules/{id}/suspendre`<br>`DELETE /admin/vehicules/{id}` |
| P3 | Corbeille véhicules | `(admin)/vehicules/corbeille/page.tsx` | `GET /admin/vehicules/corbeille`<br>`POST /admin/vehicules/{id}/restaurer`<br>`DELETE /admin/vehicules/{id}/forcer` |
| P3 | Signalements | `(admin)/signalements/page.tsx` | `GET /admin/signalements`<br>`POST /admin/signalements/{id}/traiter` |
| P3 | Statistiques marché | `(admin)/stats/page.tsx` | `GET /admin/stats/marche` |
| P3 | Statistiques géo | `(admin)/stats/geographie/page.tsx` | `GET /admin/stats/geographie` |
| P3 | Journal de modération | `(admin)/logs/page.tsx` | `GET /admin/logs` |
| P3 | Transactions | `(admin)/transactions/page.tsx` | `GET /admin/transactions` |
| P3 | Formations | `(admin)/formations/page.tsx` | `GET /admin/formations`<br>`POST /admin/formations/{id}/valider`<br>`POST /admin/formations/{id}/rejeter` |
| P3 | Support | `(admin)/support/page.tsx` | `GET /admin/support`<br>`POST /admin/support/{id}/repondre` |

---

## 9. Récapitulatif

| Priorité | Pages | Contenu |
|---|---:|---|
| **P1** | 10 | Landing, catalogue, fiche véhicule, auth complète, favoris |
| **P2** | 22 | Compte, client, formations client, espace pro |
| **P3** | 20 | Auto-école, CRM, administration |
| **Total** | **52** | |

## 10. Points de vigilance

**Deux routes commentées.** Lignes 138-141 de `routes/api.php` : `GET /transactions/rdv/{rdvId}` et `POST /transactions/{id}/confirmer`, remplacées par le préfixe `transactions-conclues`. Ne construis rien dessus.

**Pas de rôle `partenaire`.** Les rôles réels sur `users.role` sont `client`, `vendeur`, `concessionnaire`, `auto_ecole`, `admin`. Le groupe `(pro)` est une **convention d'affichage frontend** qui regroupe les trois rôles vendeurs — il ne correspond à aucune valeur en base.

**Pas de modèle `Interactions`.** `Favori`, `Alerte` et `Signalement` sont trois tables distinctes, sans discriminant `type` partagé. Trois schémas zod séparés, trois fichiers dans `src/api/`.

**Une page P1 dépend d'endpoints authentifiés.** La fiche véhicule affiche favoris / RDV / signalement uniquement si un token existe. Prévois dès le jour 3 que ces boutons soient conditionnés à la session, sinon tu te retrouveras avec des 401 sur une page publique.
