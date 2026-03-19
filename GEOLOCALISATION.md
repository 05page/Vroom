# Géolocalisation — Plan d'implémentation

## Objectif fonctionnel

Permettre aux utilisateurs de trouver des vendeurs, concessionnaires et auto-écoles
proches de leur position, avec une carte interactive et un tri par distance.

---

## Périmètre

| Qui voit quoi | Détail |
|---------------|--------|
| **Client** | Carte des vendeurs/partenaires proches + véhicules à proximité |
| **Visiteur** | Même chose sur la page catalogue publique |
| **Vendeur / Partenaire** | Peut renseigner sa position (adresse ou GPS) dans son profil |
| **Admin** | Rien de spécifique |

---

## Stack technique retenue

| Brique | Outil | Pourquoi |
|--------|-------|----------|
| Carte frontend | **Leaflet + react-leaflet** | Open source, gratuit, léger, pas de clé API |
| Tuiles carte | **OpenStreetMap** | Gratuit, aucune clé API requise |
| Géocodage (adresse → lat/lng) | **Nominatim (OpenStreetMap)** | Gratuit, pas de clé API |
| Distance backend | **Formule Haversine en SQL** | Natif MySQL, pas de dépendance |
| Géolocalisation navigateur | **Browser Geolocation API** | Natif, aucune lib |

> Choix délibéré : **zéro coût, zéro clé API** pour rester déployable immédiatement.

---

## Étapes backend (Laravel)

### Étape 1 — Migration : ajouter lat/lng sur les users
```php
// database/migrations/xxxx_add_coordinates_to_users_table.php
$table->decimal('latitude',  10, 7)->nullable();
$table->decimal('longitude', 10, 7)->nullable();
```
- Nullable car tous les users n'ont pas de position
- Concerne vendeurs, concessionnaires, auto-écoles

### Étape 2 — Géocodage automatique à la mise à jour du profil
Dans `AuthController::updatePhoneAndAddress()` (ou un nouveau endpoint) :
- Si l'adresse change → appel à l'API Nominatim pour convertir en lat/lng
- Stocker lat/lng en base
- Endpoint Nominatim : `https://nominatim.openstreetmap.org/search?q={adresse}&format=json&limit=1`

### Étape 3 — Endpoint de recherche par proximité
```
GET /api/vendeurs/proches?lat={lat}&lng={lng}&rayon={km}&role={vendeur|concessionnaire|auto_ecole}
```
Requête SQL avec formule Haversine :
```sql
SELECT *, (
  6371 * acos(
    cos(radians(?)) * cos(radians(latitude))
    * cos(radians(longitude) - radians(?))
    + sin(radians(?)) * sin(radians(latitude))
  )
) AS distance
FROM users
WHERE role IN (...)
  AND latitude IS NOT NULL
HAVING distance < ?
ORDER BY distance ASC
```
- Retourne : id, fullname, role, adresse, latitude, longitude, distance, avatar, note_moyenne

### Étape 4 — Ajouter lat/lng sur les véhicules (optionnel, hérité du vendeur)
- Option A : hériter du lat/lng du créateur du véhicule (plus simple)
- Option B : champ propre sur chaque véhicule (plus précis pour les concessionnaires multi-sites)
- **Décision retenue : Option A** pour la V1

---

## Étapes frontend (Next.js)

### Étape 5 — Installation des dépendances
```bash
cd Vroom-ci
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

### Étape 6 — Composant MapView (réutilisable)
Fichier : `components/map/MapView.tsx`
- Rendu côté client uniquement (`dynamic(() => import(...), { ssr: false })`)
- Props : `markers[]` avec lat, lng, label, type (vendeur/concessionnaire/auto_ecole)
- Icônes personnalisées par type de marqueur
- Popup au clic : nom, note, distance, bouton "Voir le profil"
- Centrage auto sur la position de l'utilisateur

### Étape 7 — Hook useGeolocation
Fichier : `src/hooks/useGeolocation.ts`
- Wrapper autour de `navigator.geolocation.getCurrentPosition`
- États : `loading`, `position`, `error`
- Fallback si l'utilisateur refuse : centrer sur Abidjan (lat: 5.3599, lng: -4.0082)

### Étape 8 — Page carte `/vendeurs-proches`
- Page publique (visiteurs + clients)
- Barre latérale : filtres (rôle, rayon en km) + liste des résultats triés par distance
- Carte plein écran à droite
- Clic sur un résultat → centre la carte + ouvre la popup

### Étape 9 — Intégration dans le catalogue véhicules
- Bouton "Voir sur la carte" dans `/vehicles`
- Affiche les véhicules disponibles avec pin, centré sur la position de l'utilisateur

### Étape 10 — Mise à jour de la position dans le profil vendeur/partenaire
- Dans la page profil : champ adresse existant
- Ajouter un bouton "Utiliser ma position GPS" → `navigator.geolocation` → reverse geocoding Nominatim → remplit le champ adresse

---

## Action API à créer

Fichier : `src/actions/geolocalisation.actions.ts`
```typescript
// Récupère les vendeurs/partenaires proches
export const getProches = (lat: number, lng: number, rayon: number, role?: string) =>
  api.get(`/vendeurs/proches?lat=${lat}&lng=${lng}&rayon=${rayon}${role ? `&role=${role}` : ""}`)
```

---

## Ressources

| Ressource | URL |
|-----------|-----|
| Documentation react-leaflet | https://react-leaflet.js.org/docs/start-installation/ |
| Leaflet (markers, popups, icônes) | https://leafletjs.com/reference.html |
| OpenStreetMap tuiles | https://tile.openstreetmap.org/{z}/{x}/{y}.png |
| Nominatim (géocodage) | https://nominatim.openstreetmap.org/search |
| Nominatim usage policy | https://operations.osmfoundation.org/policies/nominatim/ |
| Formule Haversine | https://en.wikipedia.org/wiki/Haversine_formula |
| Next.js dynamic imports (SSR off) | https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading |

---

## Ordre d'implémentation recommandé

```
Étape 1 → Étape 2 → Étape 3   (backend, peut être testé avec Postman)
     ↓
Étape 5 → Étape 6 → Étape 7   (composants de base frontend)
     ↓
Étape 8                         (page carte publique)
     ↓
Étape 9 → Étape 10              (intégrations secondaires)
```

---

## Points d'attention

- **Leaflet + SSR** : Leaflet accède à `window` → doit être importé avec `dynamic(..., { ssr: false })`
- **Nominatim rate limit** : max 1 requête/seconde, usage raisonnable requis (pas de batch)
- **Précision** : le géocodage par adresse est moins précis que le GPS — prévoir les deux
- **RGPD** : demander l'autorisation avant d'accéder à la position GPS du navigateur (déjà géré par le browser)
