# Guide d'Intégration Sécurisée des Services Externes

Ce guide décrit la bonne approche à adopter lors de l'intégration de services tiers (Google Calendar, Stripe, Twilio, etc.) dans une application Laravel pour éviter que des erreurs externes ne bloquent l'application.

## 1. Le Pattern "Graceful Failure" (Échec Gracieux)

Un service tiers ne doit jamais être une dépendance critique dont l'absence ou l'invalidité fait planter des parties non liées de l'application.

### Mauvaise Approche

Lancer une exception dans le constructeur si un jeton est manquant.

```php
public function __construct(User $user) {
    if (!$user->token) throw new Exception("Token manquant"); // ❌ DANGEREUX
}
```

### Bonne Approche

Vérifier la validité sans bloquer, et fournir des méthodes de vérification d'état.

```php
public function __construct(User $user) {
    if (!$user->token) return; // ✅ On continue l'exécution
    $this->client = new Client($user->token);
}

public static function isConnected(User $user): bool {
    return !empty($user->token);
}
```

## 2. Attention à l'Injection de Dépendances (DI)

L'injection de dépendances automatique de Laravel dans les constructeurs de contrôleurs est puissante mais risquée pour les services qui dépendent d'un état (comme l'utilisateur connecté).

### Le Risque

Si vous injectez `GoogleCalendarService` dans le constructeur du `TransactionController`, Laravel essaiera d'instancier le service dès qu'une route du contrôleur est appelée, même si cette route n'utilise pas Google Calendar. Si le constructeur du service lance une erreur, TOUTES les fonctions du contrôleur (liste des RDV, détails, etc.) deviennent inaccessibles.

### La Solution

Instanciez le service manuellement ou via une "Lazy loading" uniquement dans les méthodes qui en ont réellement besoin.

```php
public function store(Request $request) {
    // ... validation ...

    if (GoogleCalendarService::isConnected($user)) {
        $service = new GoogleCalendarService($user);
        $service->createEvent(...);
    }
}
```

## 3. Gestion des Erreurs et Logs

Entourez toujours les appels aux API externes de blocs `try/catch` et utilisez `Log::warning()` ou `Log::error()` plutôt que de laisser l'erreur remonter jusqu'à l'utilisateur final.

```php
try {
    $this->service->deleteEvent($id);
} catch (Exception $e) {
    Log::warning("Échec de suppression d'événement : " . $e->getMessage());
    // L'utilisateur n'a pas besoin de voir cette erreur technique
}
```

## 4. Casting des Données (Eloquent)

Utilisez toujours les `casts` Laravel (`array`, `json`, `datetime`) pour manipuler les données de jetons. Cela évite les erreurs manuelles de `json_decode` et garantit une structure constante dans tout votre code.
