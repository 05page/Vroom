# Architecture frontend (Vroom-ci) — reconstruction

> **Statut : 2026-08-11.** Le dossier `Vroom-ci/` a été vidé et est reconstruit de zéro.
> Le backend Laravel n'est **pas** concerné : il est intact et fait foi.
> Ce document décrit la cible, pas l'existant.

---

## 1. Le point de départ réel

Ce qu'on reconstruit n'est pas une page blanche : le frontend doit consommer un backend déjà complet.

| Élément | Quantité |
|---|---:|
| Routes API actives (`vroom-backend/routes/api.php`) | 125 |
| Contrôleurs | 26 |
| Modèles Eloquent | 23 |
| Rôles utilisateur | 5 |

**Conséquence directe : le backend impose le contrat, le frontend s'y plie.** On ne redéfinit pas un modèle de données côté React. Toute donnée affichée vient d'une des 125 routes, et sa forme est décrite par `docs/API-ENDPOINTS.md` et `docs/MCD-MLD.md`.

La correspondance page par page entre ces routes et les écrans à construire est dans [`MODULES.md`](MODULES.md) : 52 pages, chacune avec ses endpoints.

L'ancien frontend faisait **37 354 lignes**. Le reproduire en 4 jours est impossible ; ce n'est pas l'objectif. L'objectif est une base saine et extensible, dont le périmètre initial est volontairement réduit (§6).

---

## 2. Les trois problèmes de l'ancienne architecture

À ne pas reproduire. C'est la seule vraie justification de la reconstruction.

1. **Types écrits à la main.** `src/types/index.ts` centralisait des interfaces TypeScript recopiées depuis le backend. Rien ne garantissait qu'elles correspondaient à la réalité : quand une migration changeait une colonne, le type mentait silencieusement et le bug apparaissait à l'exécution.
2. **Pages obèses.** `app/landing/page.tsx` faisait 676 lignes, `app/admin/` en faisait 6 348. Fetch, état, mise en page et rendu mélangés dans le même fichier — impossible à relire, impossible à tester.
3. **Design system hors de Git.** `app/components/ui-kit/` (12 fichiers, importé par 18 pages) n'a jamais été commité. Il a été perdu définitivement le 2026-08-11. Voir §7.

---

## 3. Principe directeur

> **Une page ne fait jamais d'appel réseau elle-même.**

Quatre couches, chacune avec une seule responsabilité. La donnée descend toujours dans le même sens :

```
schema (zod)  →  api  →  hook  →  page
   forme         appel   état    affichage
```

Si tu ne sais pas où mettre un bout de code, pose-toi la question : est-ce que ça décrit une **forme**, un **appel**, un **état**, ou un **affichage** ? Il y a toujours exactement une bonne réponse.

---

## 4. Arborescence cible

```
Vroom-ci/
├── app/                        # routes Next.js — RIEN d'autre
│   ├── (public)/               # visiteur non connecté
│   │   ├── page.tsx            #   landing
│   │   ├── vehicules/
│   │   └── connexion/
│   ├── (client)/               # acheteur connecté
│   ├── (pro)/                  # vendeur · concessionnaire · auto-école
│   ├── (admin)/
│   └── api/proxy/[...path]/    # proxy vers Laravel (inchangé, cf. CLAUDE.md)
│
└── src/
    ├── schemas/                # zod — 1 fichier par domaine backend
    ├── api/                    # 1 fichier par domaine — appels réseau
    ├── hooks/                  # état React (chargement, erreur, données)
    ├── ui/                     # design system — ex-« ui-kit »
    └── lib/                    # client HTTP, utilitaires, echo.ts
```

Les parenthèses `(public)`, `(client)` sont des **route groups** Next : elles regroupent des pages sous un même `layout.tsx` sans apparaître dans l'URL. `app/(public)/vehicules/page.tsx` sert `/vehicules`.

---

## 5. Les quatre couches en détail

### 5.1 `src/schemas/` — la forme, source unique de vérité

C'est le changement central par rapport à l'ancienne version, et il solde la dette zod notée dans `docs/CHOIX-TECHNIQUES.md`.

**On n'écrit plus jamais une interface TypeScript à la main.** On écrit un schéma zod, et le type TypeScript en est *déduit* :

```ts
// src/schemas/vehicule.ts
import { z } from "zod"

export const vehiculeSchema = z.object({
    id: z.string().uuid(),
    marque: z.string(),
    modele: z.string(),
    prix: z.coerce.number(),          // Laravel renvoie parfois "8500000" (string)
    kilometrage: z.coerce.number(),
    statut: z.enum(["disponible", "vendu", "loué", "réservé"]),
})

export type Vehicule = z.infer<typeof vehiculeSchema>   // ← déduit, jamais écrit
```

Deux bénéfices, et le second est le vrai :

1. Le type ne peut plus diverger du schéma.
2. Le schéma **valide à l'exécution**. Si le backend change un champ, l'erreur apparaît immédiatement, au point d'entrée, avec un message explicite — au lieu d'un `undefined is not an object` trois composants plus loin.

`z.coerce.number()` est important ici : PHP sérialise volontiers les décimaux en chaînes. `coerce` convertit au lieu de rejeter.

### 5.2 `src/api/` — l'appel

Un fichier par domaine backend, alignés sur les préfixes de `routes/api.php` (`vehicules`, `favoris`, `rdv`, `alertes`, `notifications`…).

```ts
// src/api/vehicules.ts
import { api } from "@/src/lib/api"
import { vehiculeSchema } from "@/src/schemas/vehicule"

export async function getVehicules() {
    const data = await api.get("vehicules")
    return vehiculeSchema.array().parse(data)   // ← validation ici, une seule fois
}
```

**Règle : `parse()` n'apparaît que dans cette couche.** C'est la frontière entre « données inconnues venues du réseau » et « données sûres ». Au-delà, tout est typé et fiable.

### 5.3 `src/hooks/` — l'état

Chargement, erreur, données. Rien d'autre. Aucun JSX.

```ts
// src/hooks/useVehicules.ts
export function useVehicules() {
    // retourne { vehicules, isLoading, error }
}
```

### 5.4 `app/**/page.tsx` — l'affichage

**Objectif : moins de 150 lignes par page.** Une page appelle un hook et compose des éléments de `src/ui/`. Si elle dépasse 150 lignes, c'est qu'un morceau doit devenir un composant.

Rappel de l'ancienne version : 676 lignes pour la landing. C'est exactement ce qu'on ne refait pas.

---

## 6. Périmètre des 4 jours

Le périmètre est ce qui rend le délai tenable. Ce qui n'est pas listé ici n'est **pas** dans les 4 jours — ce n'est pas abandonné, c'est reporté.

| Jour | Livrable |
|---|---|
| 1 | Squelette Next + `lib/api` + proxy + `src/ui` (5 primitives) |
| 2 | Auth (connexion, OAuth Google, middleware de protection) |
| 3 | Catalogue `/vehicules` — liste + filtres |
| 4 | Fiche véhicule + favoris |

**Hors périmètre :** admin, dashboards pro, messagerie, RDV, transactions, formations, promotions, géolocalisation, notifications temps réel.

Ces domaines représentent l'essentiel des 125 routes. Ils se rajoutent ensuite domaine par domaine, chacun suivant les mêmes 4 couches — c'est précisément l'intérêt d'avoir une architecture répétitive.

Le découpage exact (ce qui est P1, P2, P3) est détaillé dans [`MODULES.md`](MODULES.md).

**Point de rupture le plus probable : le jour 3.** Les filtres du catalogue sont la première fonctionnalité réellement complexe. Si le retard vient, il vient de là. Sacrifice décidé à l'avance : les filtres passent en « tri simple », la fiche véhicule du jour 4 est prioritaire.

---

## 7. Charte de la marque

Décision du 2026-08-11 : **le gold `#efbf04` est conservé.** L'inspiration visuelle Tesla porte sur la mise en page, pas sur la palette.

| Retenu de Tesla | Écarté |
|---|---|
| Graisses fines (`font-light`), pas de `font-extrabold` | Le monochrome intégral |
| Sections plein écran, une idée par écran | |
| Photo en fond de section, texte par-dessus | |
| Peu de texte (~15 mots par écran) | |

Tokens définis dans `app/globals.css` en oklch : gold `#efbf04`, gris `#b4b4b4`, menthe `#d7efc2`.

---

## 8. Règles non négociables

1. **Tout fichier créé est commité le jour même.** Le design system précédent (12 fichiers, 18 pages dépendantes) a été perdu définitivement parce qu'il n'était sous aucun commit, aucune branche, aucun stash. Un fichier non commité n'existe pas.
2. **Aucune interface TypeScript écrite à la main** pour une donnée venant de l'API. Schéma zod + `z.infer`.
3. **`parse()` uniquement dans `src/api/`.**
4. **Un composant partagé vit dans `src/ui/`.** S'il lui faut une variante, on ajoute une prop — on ne le recopie jamais en local.
5. **Pas de fetch dans un `page.tsx`.**
6. **`components/ui/` (shadcn) ne se modifie pas à la main** — `npx shadcn@latest add <composant>`.

---

## 9. Documents liés

| Document | Contenu |
|---|---|
| `docs/MODULES.md` | Les 52 pages à construire et leurs endpoints |
| `docs/API-ENDPOINTS.md` | Les routes et leurs charges utiles |
| `docs/MCD-MLD.md` | Modèle de données — fait foi pour les schémas zod |
| `docs/CHOIX-TECHNIQUES.md` | Justification du stack (Sanctum, Reverb/Pusher, Leaflet, versions) |
| `docs/CAHIER-DES-CHARGES.md` | Périmètre fonctionnel |
| `CLAUDE.md` | Flux d'authentification, proxy, rôles, conventions |
