# Intégration de la messagerie — Journal de bord

## 1. Ce qui existait avant

- `app/client/messages/page.tsx` — UI complète mais branchée sur des **données mockées**
- `app/vendeur/messages/page.tsx` + `app/partenaire/messages/page.tsx` — utilisaient un composant `MessagesContent` partagé
- Aucun fichier action dédié à la messagerie
- Aucun backend pour les conversations/messages

---

## 2. Backend créé (Laravel)

### Migrations
- `2026_03_13_000001_create_conversations_table.php` — table `conversations`
- `2026_03_13_000002_add_conversation_id_to_messages_table.php` — ajout `conversation_id` + `receiver_id` à `messages`

### Modèles
- `app/Models/Conversation.php`
  - `HasUuids`
  - Relations : `participant1`, `participant2`, `vehicule`, `messages`, `lastMessage`
  - Méthode statique `findOrCreateBetween(User, User, vehiculeId)` — normalise l'ordre des participants par UUID pour garantir l'unicité
  - Méthode `getOtherParticipantId(userId)`

### Controller
- `app/Http/Controllers/ConversationController.php`
  - `GET /conversations` — liste avec dernier message, véhicule, autre participant, unread_count
  - `POST /conversations` — findOrCreate entre deux users pour un véhicule
  - `GET /conversations/{id}/messages` — messages paginés (50/page)
  - `POST /conversations/{id}/messages` — envoi + broadcast Reverb
  - `PUT /conversations/{id}/messages/{msgId}` — modification d'un message
  - `POST /conversations/{id}/read` — marquer comme lus

### Routes (`api.php`)
```php
Route::get('/conversations', [ConversationController::class, 'index']);
Route::post('/conversations', [ConversationController::class, 'findOrCreate']);
Route::get('/conversations/{id}/messages', [ConversationController::class, 'messages']);
Route::post('/conversations/{id}/messages', [ConversationController::class, 'sendMessage']);
Route::put('/conversations/{id}/messages/{messageId}', [ConversationController::class, 'updateMessage']);
Route::post('/conversations/{id}/read', [ConversationController::class, 'markAsRead']);
```

---

## 3. Frontend — `conversations.actions.ts`

Fichier créé : `Vroom-ci/src/actions/conversations.actions.ts`

```ts
export const getConversations = () =>
  api.get<ConversationsResponse>("/conversations")

export const getOrCreateConversation = (data: { other_user_id: string; vehicule_id: string }) =>
  api.post<Conversation>("/conversations", data)

export const getMessages = (conversationId: string) =>
  api.get<MessagesResponse>(`/conversations/${conversationId}/messages`)

export const sendMessage = (conversationId: string, content: string) =>
  api.post<Message>(`/conversations/${conversationId}/messages`, { content })

export const markConversationAsRead = (conversationId: string) =>
  api.post<unknown>(`/conversations/${conversationId}/read`, {})
```

### Types ajoutés dans `src/types/index.ts`
```ts
ConversationParticipant { id: string; fullname; avatar; role }
Conversation { id: string; participant_1_id; participant_2_id; vehicule_id; other_participant; vehicule?; last_message?; unread_count }
Message { id: string; conversation_id; sender_id; content; read_at; sender? }
ConversationsResponse { conversations: Conversation[] }
MessagesResponse { messages: Message[] }
```

---

## 4. Intégration dans `app/client/messages/page.tsx`

Remplacement complet des données mockées par les vraies actions :

| Action | Fonction |
|--------|----------|
| `getConversations()` | Chargement initial de la liste |
| `getMe()` | Récupérer l'user connecté (pour `isMe` sur les messages) |
| `getMessages(convId)` | Charger les messages d'une conversation |
| `sendMessage(convId, content)` | Envoyer un message |
| `markConversationAsRead(convId)` | Marquer comme lus à l'ouverture |

### Logique clé implémentée
- `useSearchParams` lit `?conv=` pour ouvrir automatiquement une conversation depuis un lien externe
- `handleSelectConv` : charge les messages + marque comme lus + reset `unread_count` localement
- `handleSend` : envoi optimiste (ajoute le message en local sans attendre)
- Scroll automatique en bas à chaque nouveau message (`useRef` + `scrollIntoView`)
- `Enter` envoie le message (`onKeyDown`)

### Bouton "Contacter le vendeur" (`VehicleDetails.tsx`)
```tsx
const handleContact = async () => {
  const res = await getOrCreateConversation({
    other_user_id: vehicule.creator.id,
    vehicule_id: vehicule.id,
  })
  if (res.data) router.push(`/client/messages?conv=${res.data.id}`)
}
```

---

## 5. Erreurs rencontrées et corrections

### Erreur 1 — 422 sur POST /conversations
**Cause** : `other_user_id` envoyé comme `Number(vehicule.creator.id)` → UUID converti en `NaN`
**Fix** : Passer les UUIDs directement en string, changer la signature de l'action de `number` à `string`

---

### Erreur 2 — 500 : `MAX(uuid)` sur PostgreSQL
**Cause** : `latestOfMany()` et `ofMany('created_at', 'max')` génèrent `MAX(id)` en interne — incompatible avec PostgreSQL sur des UUIDs
**Fix** : Suppression du `lastMessage` dans l'eager load, remplacement par une requête `DISTINCT ON (conversation_id)` :
```php
$lastMessages = Messages::selectRaw('DISTINCT ON (conversation_id) *')
    ->whereIn('conversation_id', $conversationIds)
    ->orderBy('conversation_id')
    ->orderByDesc('created_at')
    ->get()
    ->keyBy('conversation_id');
```

---

### Erreur 3 — 500 : colonne "marque" introuvable
**Cause** : `'vehicule:id,marque,modele'` — `marque` et `modele` sont dans la table `vehicule_descriptions`, pas dans `vehicules`
**Fix** : Séparation en deux eager loads :
```php
'vehicule:id',
'vehicule.description:vehicule_id,marque,modele',
```

---

### Erreur 4 — Aucune redirection après clic sur le bouton contact (silencieux)
**Cause** : Le backend retournait `$conversation` brut sans envelopper dans `{ success, data }` → `res.data` était toujours `undefined`
**Fix** : Standardisation de toutes les réponses du `ConversationController` :
```php
return response()->json(['success' => true, 'data' => $conversation], 201);
```

---

### Erreur 5 — 500 sur envoi de message (Reverb éteint)
**Cause** : `broadcast(new MessageSent($message))` crashait quand le serveur Reverb n'était pas démarré
**Fix** : Envelopper dans un try/catch silencieux :
```php
try {
    broadcast(new MessageSent($message))->toOthers();
} catch (\Throwable) {}
```

---

### Erreur 6 — `?conv=` ne sélectionne pas la conversation
**Cause** : `c.id === Number(convIdFromUrl)` — les IDs sont des UUIDs (strings), `Number("uuid")` = `NaN`
**Fix** : `c.id === convIdFromUrl` (comparaison string/string)

---

### Erreur 7 — TypeScript : `string` vs `number | undefined`
**Cause** : `User.id` typé `number`, `Message.sender_id` typé `string` → comparaison impossible sur `msg.sender_id === me?.id`
**Fix** : Correction de tous les IDs UUID dans `src/types/index.ts` :
- `User.id` : `number` → `string`
- `Conversation.id`, `Message.id`, `Message.sender_id` : `number` → `string`
- Paramètres des actions `conversationId` : `number` → `string`

---

### Erreur 8 — Photo du véhicule absente dans la carte contexte
**Cause multiple** :
1. `limit(1)` dans l'eager load contraint → limitait à 1 photo pour **toutes** les conversations réunies, pas 1 par véhicule
2. Filtre `where('is_primary', true)` → photos non marquées comme primaires ignorées
3. `'vehicule:id'` avec SoftDeletes → peut perturber l'hydratation des relations imbriquées
4. Condition `msgs.length === 0` → carte invisible pour les convs qui avaient déjà des messages

**Fix final** :
```php
// Backend : pas de restriction de colonnes, pas de limit, pas de filtre is_primary
'vehicule',
'vehicule.description:vehicule_id,marque,modele',
'vehicule.photos' => fn($q) => $q->orderBy('position'),
```
```php
// Response explicite pour garantir la sérialisation de photos
'vehicule' => $v ? ['id' => $v->id, 'description' => $v->description, 'photos' => $v->photos] : null,
```
```ts
// Frontend : affiche la carte dès qu'il y a une photo, pas seulement si 0 messages
setShowVehicleCtx(!!(conv.vehicule?.photos?.[0]))
```

---

## 6. État actuel de la messagerie

| Fonctionnalité | Statut |
|----------------|--------|
| Liste conversations (sidebar) | ✅ |
| Ouvrir une conversation | ✅ |
| Charger les messages | ✅ |
| Envoyer un message | ✅ |
| Marquer comme lus | ✅ |
| Badge non lus | ✅ |
| Recherche conversations | ✅ |
| Tabs (Tous / Non lus / Archivés) | ✅ (Archivés = vide, non implémenté) |
| Carte véhicule contexte (style WhatsApp) | ✅ |
| Lien "Contacter le vendeur" depuis une annonce | ✅ |
| Temps réel (Reverb WebSocket) | ⚠️ Broadcast côté backend ok, écoute côté frontend à brancher |

---

## 7. Ce qu'il reste à implémenter (ordre de priorité)

### Priorité 1 — Pour terminer la messagerie
- **Temps réel côté frontend** : brancher Reverb/Echo pour recevoir les nouveaux messages sans refresh
  (`window.Echo.private('conversation.{id}').listen('MessageSent', ...)`)
- **Page messages vendeur/partenaire** : `app/vendeur/messages/page.tsx` et `app/partenaire/messages/page.tsx` font appel au même système, à vérifier/brancher

### Priorité 2 — Catalogue public
- **Page détail véhicule publique** : visiteurs non connectés peuvent voir les annonces
- **Catalogue / liste véhicules** : page de recherche/filtres publique

### Priorité 3 — Modèle économique
- **Abonnements vendeurs & partenaires** : plans Free/Pro/Premium, limites d'annonces, badge "vérifié"

### Priorité 4 — Système VenteConclue/LocationConclue
- Flow RDV → terminé → code de confirmation → double validation → statut véhicule mis à jour
- Design déjà défini en mémoire (voir MEMORY.md)

### Priorité 5 — Panel admin (finitions)
- `?open=` dans `users/page.tsx` et `signalements/page.tsx` (même pattern que `vehicules/page.tsx`)

### Chantiers moyen terme
- Export PDF (contrats, fiches véhicule)
- Historique véhicule (km, entretiens)
- Géolocalisation vendeurs proches
- Formations auto-école (planning, inscriptions)
- CRM léger pour vendeurs

### Chantiers long terme
- Calculateur financement (mensualités crédit)
- Comparateur de véhicules
- Carte interactive (Leaflet / Google Maps)
