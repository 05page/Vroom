<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AlerteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\RendezVousController;
use App\Http\Controllers\SignalementController;
use App\Http\Controllers\VehiculesController;
use App\Http\Controllers\VendeurStatsController;
// À créer :
// use App\Http\Controllers\CatalogueController;
// use App\Http\Controllers\FormationController;
// use App\Http\Controllers\InscriptionFormationController;
// use App\Http\Controllers\AbonnementController;
use Illuminate\Support\Facades\Route;

// ── Public ────────────────────────────────────────────────
Route::get('/auth/{provider}/redirect', [AuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [AuthController::class, 'callback']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Avis vendeur (public — visible sans connexion)
Route::get('/avis/vendeur/{id}', [AvisController::class, 'avisVendeur']);

// ── Authentifié ───────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Profil
    Route::get('/me',         [AuthController::class, 'getInfoUser']);
    Route::put('/me/update',  [AuthController::class, 'update']);
    Route::put('/me/contact', [AuthController::class, 'updatePhoneAndAddress']);
    Route::post('/logout',    [AuthController::class, 'logout']);

    // Véhicules (lecture — tous les rôles)
    Route::prefix('vehicules')->group(function () {
        Route::get('/',     [VehiculesController::class, 'index']);

        // Écriture — vendeurs et partenaires
        Route::middleware('role:vendeur,concessionnaire,auto_ecole')->group(function () {
            Route::get('/mes-vehicules', [VehiculesController::class, 'mesVehicules']);
            Route::post('/post-vehicule',             [VehiculesController::class, 'postVehicules']);
            Route::put('/{id}',          [VehiculesController::class, 'updateVehicule']);
            Route::delete('/{id}',       [VehiculesController::class, 'deleteVehicule']);
        });
        
        Route::get('/{id}', [VehiculesController::class, 'vehicule']);
    });

    // Stats vendeur
    Route::middleware('role:vendeur,concessionnaire,auto_ecole')->group(function() {
        Route::get('/stats/mes-stats', [VendeurStatsController::class, 'mesStats']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/mes-notifs',            [NotificationsController::class, 'index']);
        Route::post('/{id}/read',  [NotificationsController::class, 'markAsRead']);
        Route::post('/read-all',   [NotificationsController::class, 'markAsAllRead']);
    });

    // Favoris
    Route::prefix('favoris')->group(function () {
        Route::get('/',                      [FavoriController::class, 'index']);
        Route::post('/{vehiculeId}',         [FavoriController::class, 'store']);
        Route::delete('/{vehiculeId}',       [FavoriController::class, 'destroy']);
    });

    // Alertes
    Route::prefix('alertes')->group(function () {
        Route::get('/',      [AlerteController::class, 'index']);
        Route::post('/',     [AlerteController::class, 'store']);
        Route::put('/{id}',  [AlerteController::class, 'update']);
        Route::delete('/{id}', [AlerteController::class, 'destroy']);
    });

    // Signalements
    Route::prefix('signalements')->group(function () {
        Route::post('/',               [SignalementController::class, 'store']);
        Route::get('/mes-signalements',[SignalementController::class, 'mesSignalements']);
    });

    // Rendez-vous
    Route::prefix('rdv')->group(function () {
        Route::get('/mes-rdv',       [RendezVousController::class, 'mesRdv']);
        Route::post('/',             [RendezVousController::class, 'store']);
        Route::post('/{id}/annuler', [RendezVousController::class, 'annuler']);
        Route::middleware('role:vendeur,concessionnaire,auto_ecole')->group(function () {
            Route::get('/nos-rdv',         [RendezVousController::class, 'nosRdv']);
            Route::post('/{id}/confirmer', [RendezVousController::class, 'confirmer']);
            Route::post('/{id}/refuser',   [RendezVousController::class, 'refuser']);
            Route::post('/{id}/terminer',  [RendezVousController::class, 'terminer']);
        });
    });

    // Avis (écriture — authentifié)
    Route::post('/avis', [AvisController::class, 'store']);

    // ── Routes à activer une fois les contrôleurs créés ──

    // Formations (auto-école)
    // Route::prefix('formations')->group(function () {
    //     Route::get('/',     [FormationController::class, 'index']);
    //     Route::get('/{id}', [FormationController::class, 'show']);
    //     Route::middleware('role:auto_ecole')->group(function () {
    //         Route::post('/',     [FormationController::class, 'store']);
    //         Route::put('/{id}',  [FormationController::class, 'update']);
    //         Route::delete('/{id}', [FormationController::class, 'destroy']);
    //     });
    //     Route::post('/{id}/inscrire', [InscriptionFormationController::class, 'store']);
    // });

    // Abonnements
    // Route::prefix('abonnements')->group(function () {
    //     Route::get('/plans',          [AbonnementController::class, 'plans']);
    //     Route::post('/souscrire',     [AbonnementController::class, 'souscrire']);
    //     Route::get('/mon-abonnement', [AbonnementController::class, 'monAbonnement']);
    // });

    // ── Admin ─────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/admins',                     [AdminController::class, 'admins']);
        Route::post('/admins',                    [AdminController::class, 'createAdmin']);
        Route::get('/users',                      [AdminController::class, 'users']);
        Route::post('/users/{id}/suspendre',      [AdminController::class, 'suspendre']);
        Route::post('/users/{id}/bannir',         [AdminController::class, 'bannir']);
        Route::post('/users/{id}/restaurer',      [AdminController::class, 'restaurer']);
        Route::post('/users/{id}/valider',        [AdminController::class, 'validerCompte']);
        Route::get('/vehicules/en-attente',       [AdminController::class, 'vehiculesEnAttente']);
        Route::post('/vehicules/{id}/valider',    [AdminController::class, 'validerVehicule']);
        Route::post('/vehicules/{id}/rejeter',    [AdminController::class, 'rejeterVehicule']);
        Route::get('/signalements',               [AdminController::class, 'signalements']);
        Route::post('/signalements/{id}/traiter', [AdminController::class, 'traiterSignalement']);
        Route::get('/logs',                       [AdminController::class, 'logs']);
    });
});
