# État du projet Vroom — Analyse v1

> Dernière mise à jour : 2026-03-14

## Légende : ✅ Fait · ⚠️ Partiel · ❌ Manquant

---

## BACKEND

| Module | Fonctionnalités | État | Ce qui manque |
|--------|----------------|------|---------------|
| **Auth** | OAuth Google, login local, register, logout, Sanctum token, cookie httpOnly | ✅ Complet | — |
| **Profil utilisateur** | GET me, update profil, update contact | ✅ Complet | — |
| **Véhicules** | CRUD annonce, photos, description, validation Gemini (Job), tracking vues | ✅ Complet | — |
| **Validation admin véhicules** | en_attente → validée/rejetée, log audit | ✅ Complet | — |
| **Rendez-vous** | Créer (client), confirmer/refuser/annuler/terminer (vendeur), Google Calendar | ✅ Complet | — |
| **Notifications** | BDD + broadcast Reverb temps-réel, 5 types, mark as read | ✅ Complet | — |
| **Favoris** | Add/remove/list | ✅ Complet | — |
| **Alertes** | Critères multiples, CRUD | ✅ Complet | — |
| **Avis** | Laisser avis après RDV terminé, note_moyenne auto-calculée | ✅ Complet | — |
| **Signalements** | Créer (client), traiter/rejeter (admin) + action sur cible + notifs | ✅ Complet | — |
| **Stats vendeur** | Vues, RDV, top véhicules, stats mensuelles | ✅ Complet | — |
| **Admin — Users** | Suspendre, bannir, restaurer, valider compte partenaire | ✅ Complet | — |
| **Admin — Logs** | Audit immuable, filtre par cible_type | ✅ Complet | — |
| **Admin — Stats** | Page créée | ⚠️ Partiel | Routes backend admin stats manquantes |
| **Messagerie** | Conversations, messages, broadcast Reverb, canal privé auth | ✅ Complet | — |
| **Formations** | Modèles + migrations OK | ⚠️ Partiel | `FormationController` manquant, routes inactives |
| **Abonnements** | Modèles + migrations + plans OK | ⚠️ Partiel | `AbonnementController` manquant, routes inactives |
| **VenteConclue** | Design validé en session précédente | ❌ Manquant | Modèle, migration, controller, routes |

---

## FRONTEND

| Module | Pages / Composants | État | Ce qui manque |
|--------|--------------------|------|---------------|
| **Auth** | Page login/register/OAuth, callback, middleware protection routes | ✅ Complet | — |
| **Landing page** | Page publique d'accueil | ✅ Complet | — |
| **Catalogue public** | Liste véhicules, détails véhicule | ✅ Complet | — |
| **Client — Favoris** | Page liste des favoris | ✅ Complet | — |
| **Client — Notifications** | Page notifications + temps-réel | ✅ Complet | — |
| **Client — RDV** | Liste RDV demandés par le client | ✅ Complet | — |
| **Client — Profil** | Édition profil | ✅ Complet | — |
| **Vendeur — Dashboard** | Vue globale + stats | ✅ Complet | — |
| **Vendeur — Véhicules** | Liste, détails, édition, ajout | ✅ Complet | — |
| **Vendeur — RDV** | RDV reçus, confirmer/refuser/terminer | ✅ Complet | — |
| **Vendeur — Stats** | Graphiques et KPIs | ✅ Complet | — |
| **Partenaire — Dashboard** | KPIs enrichis | ✅ Complet | — |
| **Partenaire — MonGarage** | DataTable, ajout, colonnes, détail | ✅ Complet | — |
| **Partenaire — RDV** | Gestion RDV côté partenaire | ✅ Complet | — |
| **Partenaire — Stats** | Page stats partenaire | ✅ Complet | — |
| **Partenaire — Settings** | Paramètres compte | ✅ Complet | — |
| **Admin — Dashboard** | Vue globale | ✅ Complet | — |
| **Admin — Users** | Gestion utilisateurs | ✅ Complet | — |
| **Admin — Véhicules** | Modération, Sheet `?open=` | ✅ Complet | — |
| **Admin — Signalements** | Drawer détail, actions cibles | ✅ Complet | — |
| **Admin — Logs** | Filtre, liens détail | ✅ Complet | — |
| **Admin — Stats** | Page créée | ⚠️ Partiel | Branchement API manquant |
| **Messagerie** | Pages client/vendeur/partenaire branchées sur API, temps réel Reverb | ✅ Complet | — |
| **Client — Alertes** | Structure type existe | ⚠️ Partiel | Page dédiée à vérifier |
| **Formations** | Page partenaire/abonnements présente | ⚠️ Partiel | Dépend du backend manquant |
| **Abonnements** | Page partenaire/abonnements présente | ⚠️ Partiel | Dépend du backend manquant |
| **Vente conclue** | — | ❌ Manquant | Pages confirmation vendeur + client |

---

## Résumé pour une v1 "utilisable"

### Ce qui est prêt maintenant
- Inscription / connexion / profil
- Déposer et consulter des annonces
- Prendre et gérer des RDV (workflow complet)
- Favoris, alertes, avis, notifications temps-réel
- Panel admin opérationnel
- **Messagerie complète** (conversations, messages, temps réel Reverb, lien depuis annonce)

### Ce qu'il faut finir

| Priorité | Module | Effort |
|----------|--------|--------|
| 🔴 Haute | **Catalogue public** — vitrine visiteurs non connectés | Élevé |
| 🔴 Haute | **VenteConclue** — modèle + double confirmation + stats | Élevé |
| 🟡 Moyenne | **Abonnements** — plans vendeurs & partenaires (modèle éco) | Élevé |
| 🟡 Moyenne | **Admin Stats** — brancher les routes backend | Faible |
| 🟡 Moyenne | **Client Alertes** — vérifier la page dédiée | Faible |
| 🟡 Moyenne | **Admin `?open=`** — users/page.tsx + signalements/page.tsx | Faible |
| 🟢 Basse | **Formations** — FormationController + routes + pages | Élevé |

> Pour une v1 solide : **Catalogue public + VenteConclue + Abonnements** sont les prochains chantiers.
> Formations peut attendre une v2.


## Elements à corriger dans les messages
1- Dispositions des images
2- Affichage des images liés aux postes concernés par le message
3-Affichage du nombre de message non lu
