# Documentation Frontend — Vroom CI

> Stack : **Next.js 16** · **TypeScript** · **Tailwind CSS v4** · **shadcn/ui**
> Répertoire : `Vroom-ci/`

---

## Sommaire

1. [Démarrage rapide](#1-démarrage-rapide)
2. [Structure des dossiers](#2-structure-des-dossiers)
3. [Authentification & protection des routes](#3-authentification--protection-des-routes)
4. [Comment appeler le backend (client API)](#4-comment-appeler-le-backend-client-api)
5. [Actions — la couche de données](#5-actions--la-couche-de-données)
6. [Récupérer l'utilisateur connecté](#6-récupérer-lutilisateur-connecté)
7. [Pages par rôle](#7-pages-par-rôle)
8. [Composants partagés](#8-composants-partagés)
9. [Types TypeScript](#9-types-typescript)
10. [Temps réel (WebSocket)](#10-temps-réel-websocket)
11. [UI — règles et composants](#11-ui--règles-et-composants)
12. [Variables d'environnement](#12-variables-denvironnement)
13. [Erreurs fréquentes et solutions](#13-erreurs-fréquentes-et-solutions)

---

## 1. Démarrage rapide

```bash
cd Vroom-ci
npm install          # installer les dépendances
npm run dev          # lancer sur http://localhost:3000
npm run build        # build de production
npm run lint         # vérifier les erreurs ESLint
```

> Le backend Laravel doit tourner en même temps sur `http://localhost:8000`.

---

## 2. Structure des dossiers

```
Vroom-ci/
├── app/                        # Pages Next.js (App Router)
│   ├── layout.tsx              # Layout racine (providers, Header, Toaster)
│   ├── page.tsx                # Page d'accueil publique
│   ├── globals.css             # Variables CSS + thème
│   │
│   ├── api/
│   │   └── proxy/[...path]/route.ts   # ← Proxy vers le backend (NE PAS MODIFIER)
│   │   └── auth/callback/route.ts     # ← Réception du token OAuth après login
│   │
│   ├── auth/                   # Pages de connexion / inscription
│   ├── vehicles/               # Catalogue public (non connecté)
│   ├── landing/                # Page d'atterrissage marketing
│   │
│   ├── client/                 # Pages réservées aux clients (acheteurs)
│   ├── vendeur/                # Pages réservées aux vendeurs
│   ├── partenaire/             # Pages réservées aux partenaires (concessionnaire / auto-école)
│   ├── admin/                  # Panel d'administration
│   │
│   └── components/             # Composants "app-level" (Header, MessagesContent, etc.)
│
├── components/ui/              # Composants shadcn/ui — NE PAS MODIFIER MANUELLEMENT
│
├── src/
│   ├── actions/                # Fonctions d'appel API (une par domaine métier)
│   ├── context/
│   │   └── UserContext.tsx     # Contexte React — user connecté accessible partout
│   ├── lib/
│   │   └── api.ts              # Client HTTP central
│   └── types/
│       └── index.ts            # Toutes les interfaces TypeScript
│
├── middleware.ts               # Garde d'accès aux routes privées
└── next.config.ts              # Configuration Next.js
```

### Règle importante : App Router
Chaque page est un fichier `page.tsx` dans un dossier. Si le composant utilise un état React ou des événements (`useState`, `useEffect`, `onClick`...) il faut mettre `"use client"` en première ligne. Sinon il sera rendu côté serveur.

---

## 3. Authentification & protection des routes

### Comment ça marche

1. L'utilisateur clique "Se connecter avec Google"
2. Il est redirigé vers `GET /api/auth/google/redirect` (backend Laravel)
3. Google OAuth → backend crée/met à jour le compte
4. Backend redirige vers `http://localhost:3000/api/auth/callback?token=...&role=...&data=...`
5. Next.js (`app/api/auth/callback/route.ts`) lit le token et le stocke dans un **cookie httpOnly** `auth_token` (valide 7 jours)
6. Ce cookie est envoyé automatiquement à chaque requête

### Protection des routes — `middleware.ts`

Le fichier `middleware.ts` à la racine vérifie que le cookie `auth_token` est présent avant d'autoriser l'accès aux routes privées.

Routes protégées :
- `/client/*` → rôle `client`
- `/vendeur/*` → rôle `vendeur`
- `/partenaire/*` → rôle `concessionnaire` ou `auto_ecole`
- `/admin/*` → rôle `admin`

Si le cookie est absent → redirection vers `/auth`.
Si le rôle ne correspond pas → redirection vers le bon dashboard.

### Layouts par rôle

Chaque espace a son propre `layout.tsx` qui gère la sidebar et la navigation :
- `app/admin/layout.tsx`
- `app/vendeur/layout.tsx` (dans `app/vendeur/layout.tsx`)
- `app/partenaire/layout.tsx`

> Les clients n'ont pas de layout dédié, ils utilisent le layout racine avec le Header.

---

## 4. Comment appeler le backend (client API)

### Ne jamais appeler le backend directement

Tout passe par le **proxy Next.js** : `app/api/proxy/[...path]/route.ts`

```
Browser → /api/proxy/vehicules → http://127.0.0.1:8000/api/vehicules
```

Le proxy ajoute automatiquement le header `Authorization: Bearer {token}` depuis le cookie.

### Utiliser le client `api`

```typescript
import { api } from "@/src/lib/api"

// GET
const res = await api.get<{ success: boolean; data: MaType[] }>("/vehicules")

// POST
const res = await api.post<{ success: boolean; data: MaType }>("/rdv", {
  vendeur_id: "...",
  vehicule_id: "...",
  date_heure: "2026-04-01T10:00",
  type: "visite",
})

// PUT
const res = await api.put<{ success: boolean }>("/me/update", { fullname: "Jean" })

// DELETE
const res = await api.delete<{ success: boolean }>("/favoris/abc-123")

// Upload de fichiers (multipart/form-data)
const formData = new FormData()
formData.append("photo", file)
const res = await api.upload<{ success: boolean }>("/vehicules/post-vehicule", formData)
```

### Format de réponse standard

Le backend retourne toujours :
```typescript
{
  success: boolean,
  data?: T,        // la donnée principale
  message?: string,
  errors?: Record<string, string[]>  // erreurs de validation
}
```

### Gestion des erreurs

```typescript
try {
  const res = await api.get<{ success: boolean; data: Vehicule[] }>("/vehicules")
  if (res.data) setVehicules(res.data)
} catch (err) {
  toast.error("Impossible de charger les véhicules")
}
```

---

## 5. Actions — la couche de données

Les **actions** sont des fonctions dans `src/actions/`. Elles encapsulent les appels API pour éviter de réécrire les mêmes `api.get()` partout.

> **Règle :** Ne jamais mettre `"use server"` dans ces fichiers — les actions sont appelées côté client via `useEffect`.

### Liste des fichiers d'actions

| Fichier | Fonctions principales |
|---------|----------------------|
| `auth.actions.ts` | `getMe()`, `updateProfile()`, `updateContact()` |
| `vehicules.actions.ts` | `getVehicules()`, `getVehicule(id)`, `getMesVehicules()`, `postVehicule()`, `updateVehicule()`, `deleteVehicule()` |
| `conversations.actions.ts` | `getConversations()`, `findOrCreateConversation()`, `getMessages()`, `sendMessage()`, `markConversationAsRead()`, `deleteMessage()` |
| `formations.actions.ts` | `getFormations()`, `getMesFormations()`, `createFormation()`, `updateFormation()`, `sInscrire()`, `getMesInscriptions()`, `getMesStats()` |
| `rdv.actions.ts` | `getMesRdv()`, `getNosRdv()`, `createRdv()`, `annulerRdv()`, `confirmerRdv()`, `terminerRdv()` |
| `transactions.actions.ts` | `getMesDemandes()`, `getMesTransactions()`, `confirmerVendeur()`, `confirmerClient()` |
| `admin.actions.ts` | Toutes les actions du panel admin (users, véhicules, stats, signalements, formations, support) |
| `notifications.actions.ts` | `getMesNotifs()`, `markAsRead()`, `markAllAsRead()` |
| `favoris.actions.ts` | `getFavoris()`, `addFavori()`, `removeFavori()` |
| `signalements.actions.ts` | `getMesSignalements()`, `createSignalement()` |
| `alertes.actions.ts` | `getAlertes()`, `createAlerte()`, `updateAlerte()`, `deleteAlerte()` |
| `avis.actions.ts` | `getAvisVendeur(id)`, `createAvis()` |
| `crm.actions.ts` | `getCrmClients()`, `getCrmClientDetail()`, `addNote()`, `updateNote()`, `deleteNote()` |
| `stats.actions.ts` | `getMesStats()` (stats vendeur) |
| `support.actions.ts` | `getMesTickets()`, `soumettreTicket()`, `repondreTicket()` |
| `abonnements.actions.ts` | `getPlans()`, `getMonAbonnement()`, `souscrire()`, `resilier()` |

### Exemple d'utilisation dans une page

```typescript
"use client"
import { useEffect, useState } from "react"
import { getMesRdv } from "@/src/actions/rdv.actions"
import type { RendezVous } from "@/src/types"

export default function MesRdvPage() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([])

  useEffect(() => {
    getMesRdv().then(res => {
      if (res.data) setRdvs(res.data)
    })
  }, [])

  // ...
}
```

---

## 6. Récupérer l'utilisateur connecté

Le `UserContext` charge automatiquement l'utilisateur connecté au démarrage de l'app.

```typescript
"use client"
import { useUser } from "@/src/context/UserContext"

export default function MonComposant() {
  const { user, loading } = useUser()

  if (loading) return <p>Chargement...</p>
  if (!user)   return <p>Non connecté</p>

  return <p>Bonjour {user.fullname}, rôle : {user.role}</p>
}
```

### Interface User

```typescript
interface User {
  id: string
  fullname: string
  role: string           // "client" | "vendeur" | "concessionnaire" | "auto_ecole" | "admin"
  partenaire_type: string
  email: string
  telephone: string
  adresse: string
  account_status: string // "actif" | "suspendu" | "banni" | "en_attente"
}
```

---

## 7. Pages par rôle

### Pages publiques (sans connexion)
| URL | Fichier | Description |
|-----|---------|-------------|
| `/` | `app/page.tsx` | Page d'accueil |
| `/vehicles` | `app/vehicles/page.tsx` | Catalogue public |
| `/vehicles/[id]` | `app/vehicles/[id]/page.tsx` | Détail d'un véhicule |
| `/auth` | `app/auth/page.tsx` | Login / Inscription |

### Client
| URL | Description |
|-----|-------------|
| `/client/messages` | Messagerie avec vendeurs |
| `/client/notifications` | Notifications |
| `/client/favorites` | Véhicules favoris |
| `/client/transactions` | Transactions (achats / locations) |
| `/client/formations` | Inscriptions formations |
| `/client/aide` | Aide & support |
| `/client/suggestions` | Suggestions basées sur les alertes |

### Vendeur
| URL | Description |
|-----|-------------|
| `/vendeur/dashboard` | Vue d'ensemble + graphique activité mensuelle |
| `/vendeur/vehicles` | Liste et gestion des annonces |
| `/vendeur/rdv` | Rendez-vous clients |
| `/vendeur/messages` | Messagerie |
| `/vendeur/stats` | Statistiques détaillées |
| `/vendeur/transactions` | Transactions conclues |
| `/vendeur/crm` | CRM clients (notes, historique) |
| `/vendeur/crm/[clientId]` | Fiche détaillée d'un client |
| `/vendeur/aide` | Aide & support |

### Partenaire (concessionnaire + auto-école)
| URL | Visible par | Description |
|-----|-------------|-------------|
| `/partenaire/dashboard` | Tous | Vue d'ensemble |
| `/partenaire/mongarage` | Concessionnaire | Catalogue véhicules |
| `/partenaire/rdv` | Tous | Rendez-vous |
| `/partenaire/messages` | Tous | Messagerie |
| `/partenaire/stats` | Tous | Statistiques |
| `/partenaire/formations` | Auto-école | Gestion des formations |
| `/partenaire/trend` | Tous | Tendances du marché |
| `/partenaire/aide` | Tous | Aide & support |

> La sidebar filtre automatiquement les liens selon `user.role` dans `partenaire/layout.tsx`.

### Admin
| URL | Description |
|-----|-------------|
| `/admin/dashboard` | Vue d'ensemble plateforme |
| `/admin/users` | Gestion utilisateurs (suspension, validation partenaires) |
| `/admin/vehicules` | Modération annonces |
| `/admin/formations` | Validation formations |
| `/admin/transactions` | Suivi transactions |
| `/admin/signalements` | Traitement signalements |
| `/admin/logs` | Journal d'actions admin |
| `/admin/stats` | Statistiques globales + données marché + géographie |
| `/admin/support` | Réponse aux tickets de support |
| `/admin/admins` | Création de comptes admin |

#### Pattern `?open={id}` dans les pages admin

Les pages `users`, `vehicules` et `signalements` supportent le paramètre `?open={id}` dans l'URL. Quand il est présent, la page ouvre automatiquement le Sheet de détail de l'élément correspondant.

C'est utilisé par la page `/admin/logs` : quand on clique "Voir le détail" sur une entrée de log, ça redirige vers la liste avec ce paramètre.

```typescript
// Exemple : /admin/users?open=42 → ouvre le Sheet de l'utilisateur #42
const searchParams = useSearchParams()
const openId = searchParams.get("open")

useEffect(() => {
  if (openId && users.length > 0) {
    const found = users.find(u => String(u.id) === String(openId))
    if (found) setSelectedUser(found)
  }
}, [users, openId])
```

---

## 8. Composants partagés

Ces composants sont dans `app/components/` et peuvent être réutilisés dans n'importe quelle page.

| Composant | Rôle |
|-----------|------|
| `Header.tsx` | Barre de navigation principale (logo, menu, notifs, messagerie, profil) |
| `ConditionalHeader.tsx` | Affiche le Header uniquement si l'user est connecté |
| `NotificationsContent.tsx` | Panel liste notifications avec bouton "marquer tout comme lu" |
| `MessagesContent.tsx` | Interface messagerie complète (liste conversations + chat) |
| `ProfileContent.tsx` | Panel profil (avatar, infos, déconnexion) |
| `EditProfil.tsx` | Dialog de modification du profil |
| `AideContent.tsx` | FAQ + formulaire soumission ticket support |

### Exemple d'utilisation de `MessagesContent`

```typescript
// Les pages /vendeur/messages, /partenaire/messages et /client/messages
// réutilisent toutes ce composant
import MessagesContent from "@/app/components/MessagesContent"

export default function MessagesPage() {
  return <MessagesContent />
}
```

---

## 9. Types TypeScript

Tous les types sont centralisés dans `src/types/index.ts`. **Ne jamais recréer un type qui existe déjà.**

### Types les plus utilisés

```typescript
// Véhicule
interface vehicule {
  id: string
  post_type: "vente" | "location"
  statut: "disponible" | "vendu" | "loué" | "suspendu" | "banni"
  status_validation: "en_attente" | "validee" | "rejetee"
  prix: number
  negociable: boolean
  creator?: { id: string; fullname: string; role?: string }
  description: VehiculeDescription
  photos?: VehiculePhotos[]
}

// Rendez-vous
interface RendezVous {
  id: string
  type: "visite" | "essai_routier" | "premiere_rencontre"
  statut: "en_attente" | "confirmé" | "refusé" | "annulé" | "terminé"
  date_heure: string
  client?: { id: string; fullname: string }
  vendeur?: { id: string; fullname: string }
  vehicule?: vehicule
}

// Message
interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_at: string | null   // null = non lu
  sender?: ConversationParticipant
}

// Notification
interface Notifications {
  id: number
  type: string
  title: string
  message: string
  is_read: boolean
  unread_count: number
  created_at: Date
}
```

> **Attention :** Les valeurs avec accents dans les enums PostgreSQL (`"résolu"`, `"fermé"`, `"terminé"`) **doivent garder leurs accents** dans le TypeScript. Ne pas les remplacer par `"resolu"`, `"ferme"` etc.

---

## 10. Temps réel (WebSocket)

L'app utilise **Laravel Reverb** côté serveur et **Pusher.js** côté client pour les fonctionnalités en temps réel.

### Ce qui est en temps réel
- Nouvelles notifications (toutes les actions importantes déclenchent une notification)
- Nouveaux messages dans les conversations

### Comment s'abonner à un canal

```typescript
// Exemple simplifié
import Pusher from "pusher-js"

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  cluster: "...",
  wsHost: "localhost",
  wsPort: 8080,
  forceTLS: false,
})

// Canal privé par user
const channel = pusher.subscribe(`private-user.${userId}`)
channel.bind("NotificationBroadcast", (data: Notifications) => {
  // Nouveau message de notification reçu
})

// Canal conversation
const conv = pusher.subscribe(`private-conversation.${conversationId}`)
conv.bind("MessageSent", (data: Message) => {
  // Nouveau message reçu
})
```

### Variables nécessaires dans `.env.local`
```
NEXT_PUBLIC_PUSHER_APP_KEY=...
NEXT_PUBLIC_PUSHER_APP_CLUSTER=...
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
```

---

## 11. UI — règles et composants

### Composants shadcn/ui

Les composants UI se trouvent dans `components/ui/`. **Ne jamais les modifier manuellement.**

Pour en ajouter un nouveau :
```bash
cd Vroom-ci
npx shadcn@latest add button      # exemple
npx shadcn@latest add sheet       # autre exemple
```

### Toasts (notifications pop-up)

```typescript
import { toast } from "sonner"

toast.success("Véhicule validé !")
toast.error("Erreur lors de la soumission")
toast.loading("Chargement...")
toast.dismiss()        // ferme le toast loading
```

### Couleurs Tailwind

Le projet utilise **Tailwind v4** avec des variables CSS en `oklch`. Ne pas utiliser l'ancienne syntaxe `bg-blue-500` pour les couleurs sémantiques — préférer les variables :
```html
bg-primary         text-primary-foreground
bg-secondary       text-secondary-foreground
bg-muted           text-muted-foreground
bg-destructive
border-border
```

### Skeleton (état de chargement)

```typescript
import { Skeleton } from "@/components/ui/skeleton"

// Pendant le chargement d'une liste
{loading ? (
  [...Array(3)].map((_, i) => (
    <Skeleton key={i} className="h-16 w-full rounded-lg" />
  ))
) : (
  // contenu réel
)}
```

---

## 12. Variables d'environnement

Fichier `Vroom-ci/.env.local` (à créer, non versionné) :

```env
# URL du backend (pour le proxy serveur Next.js)
BACKEND_URL=http://127.0.0.1:8000/api

# URL du backend accessible depuis le navigateur (pour OAuth et images)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# WebSocket Reverb
NEXT_PUBLIC_PUSHER_APP_KEY=vroom-key
NEXT_PUBLIC_PUSHER_APP_CLUSTER=mt1
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
```

---

## 13. Erreurs fréquentes et solutions

### "Cannot read properties of undefined (reading 'className')"
**Cause :** Un objet de config (ex: `STATUT_CONFIG["resolu"]`) renvoie `undefined` car la clé ne correspond pas à la valeur réelle en base (souvent un problème d'accent).

**Solution :** Vérifier que les clés de l'objet correspondent exactement aux valeurs retournées par le backend. Les valeurs PostgreSQL avec accents (`"résolu"`, `"terminé"`) doivent rester avec leurs accents.

---

### "Failed to load resource: 500" sur une action
**Causes fréquentes :**
1. L'endpoint n'existe pas côté backend → vérifier `vroom-backend/routes/api.php`
2. Le middleware de rôle bloque la requête → vérifier que l'utilisateur a le bon rôle
3. Une validation Laravel échoue → vérifier les champs envoyés

**Pour débugger :** Ouvrir les DevTools → onglet Réseau → trouver la requête en 500 → regarder la réponse JSON (le backend retourne généralement un message d'erreur).

---

### La page ne recharge pas les données après une action
**Cause :** L'état local n'est pas rafraîchi après le `api.post()`.

**Solution :** Rappeler la fonction `fetch` après l'action :
```typescript
const handleDelete = async (id: string) => {
  await deleteVehicule(id)
  await fetchVehicules()   // ← rafraîchir l'état
}
```

---

### "useSearchParams() should be wrapped in a Suspense boundary"
**Cause :** Next.js App Router exige que les composants utilisant `useSearchParams()` soient dans un `<Suspense>`.

**Solution :**
```typescript
import { Suspense } from "react"

export default function Page() {
  return (
    <Suspense>
      <MonComposantAvecSearchParams />
    </Suspense>
  )
}
```

---

### Les images du backend ne s'affichent pas
**Cause :** Le domaine n'est pas autorisé dans `next.config.ts`.

**Solution :** Ajouter le domaine dans `remotePatterns` dans `next.config.ts`.

---

*Dernière mise à jour : Mars 2026*
