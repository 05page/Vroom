# Checklist de déploiement — Vroom

> Phase 4 de [`PLAN-RATTRAPAGE.md`](../PLAN-RATTRAPAGE.md). À dérouler avant toute mise en production ou changement d'hébergeur.

## Backend (`vroom-backend/`)

> **Automatisé depuis le 2026-07-25** : `composer install`, `php artisan migrate --force`, `storage:link`, `config:cache`/`route:cache`/`view:cache` sont exécutés automatiquement par le job `deploy-backend` de [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) à chaque push sur `main` (après que les tests soient passés), via SSH vers Hostinger. Les points ci-dessous restent à vérifier manuellement (config une seule fois, pas à chaque déploiement) ou en cas de mise en place initiale sur un nouvel hébergeur.

- [ ] `.env` en production : `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` généré (`php artisan key:generate`), toutes les variables de [`.env.example`](../vroom-backend/.env.example) renseignées
- [ ] `BROADCAST_CONNECTION=pusher` (pas `reverb`) en production — voir [`CHOIX-TECHNIQUES.md`](CHOIX-TECHNIQUES.md), Reverb auto-hébergé ne convient qu'au dev local
- [ ] Seeders (à rejouer manuellement, jamais automatisés) : `PlanAbonnementSeeder` (idempotent, à rejouer sans risque) et `AdminSeeder` (idempotent via `updateOrCreate` sur l'email admin — **bug corrigé le 2026-07-23** : mettait `niveau_acces => 1`, valeur invalide pour l'ENUM `{standard, super_admin}`, le seeder plantait). Définir `ADMIN_EMAIL`/`ADMIN_PASSWORD` en variables d'env avant de lancer, sinon un mot de passe aléatoire est généré et affiché une seule fois en console.
- [ ] Queue worker : traité via cron (`php artisan queue:work --stop-when-empty` chaque minute) sur ce plan Hostinger mutualisé, pas de process persistant — sinon `ValidateVehiculeWithGemini` (modération IA) ne se traite jamais
- [ ] Scheduler actif : cron `* * * * * php artisan schedule:run` — sans lui, `ExpireReservations`, `SendReservationReminders` et `CheckTendances` (`tendances:check`, horaire) ne tournent jamais
- [ ] `php artisan test` vert avant tout déploiement (bloquant : le job `deploy-backend` ne se déclenche pas si les tests échouent)

### Suivre un déploiement backend / diagnostiquer une erreur

Après un push sur `main` :

```bash
gh run watch                          # suit le run en cours en direct dans le terminal
gh run list --limit 5                 # état des derniers runs (success/failure, commit, durée)
gh run view <run-id>                  # détail par job (Backend / Frontend / Deploy backend)
gh run view <run-id> --log-failed     # message d'erreur exact, uniquement les étapes en échec
```

Pour confirmer indépendamment que le serveur a bien le dernier code (sans se fier au ✓ GitHub) :

```bash
ssh -p <port> <user>@<host> "cd <chemin_backend> && git log -1 --oneline"
```

## Frontend (`Vroom-ci/`)

- [ ] Le projet utilise **pnpm**, pas npm (voir `package.json` → `packageManager`) — `pnpm install`, jamais `npm install`
- [ ] `.env.local` en production : toutes les variables de [`.env.local.example`](../Vroom-ci/.env.local.example), avec `NEXT_PUBLIC_PUSHER_KEY` défini (bascule automatique Reverb→Pusher, voir `src/lib/echo.ts`)
- [ ] `pnpm build` sans erreur
- [ ] `pnpm test` vert (28 tests Vitest — permissions, middleware, validators)
- [ ] `pnpm lint` sans erreur bloquante

## Vérifications transverses

- [ ] `FRONTEND_URL` (backend) et `NEXT_PUBLIC_BACKEND_URL`/`BACKEND_URL` (frontend) pointent bien l'un vers l'autre en prod (pas de `localhost` qui traîne)
- [ ] Callback OAuth Google (`GOOGLE_REDIRECT_URL`) enregistré dans la console Google Cloud pour le domaine de prod
- [ ] Clés `REVERB_*`/`PUSHER_*` identiques des deux côtés (backend/frontend)
- [ ] Aucun secret (`.env`, `.env.local`) commité — vérifier `.gitignore`
