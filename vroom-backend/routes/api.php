<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\moderationsController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserInfoController;
use App\Http\Controllers\VehiculesController;
use App\Http\Controllers\VendeurStatsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;
use App\Services\GoogleCalendarService;
use App\Models\User;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//auth
Route::get('/auth/{provider}/redirect', [AuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [AuthController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'getInfoUser']);
    Route::put('/me/update', [AuthController::class, 'update']);
    Route::put('updatePhone', [AuthController::class, 'updatePhoneAndAddress']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Routes pour les véhicules
    Route::prefix('vehicules')->group(function () {
        Route::get('/allVehicules', [VehiculesController::class, 'index']);
        Route::get('/{id}/vehicule', [VehiculesController::class, 'vehicule']);
        Route::middleware(['role:vendeur,partenaire'])->group(function () {
            Route::get('/mesVehicules', [VehiculesController::class, 'mesVehicules']);
            Route::post('/postVehicules', [VehiculesController::class, 'postVehicules']);
            Route::put('/updateVehicules/{id}', [VehiculesController::class, 'updateVehicule']);
            Route::delete('/deleteVehicules/{id}', [VehiculesController::class, 'deleteVehicule']);
        });
        // Route::post('test-gemini', [VehiculesController::class, 'testGemini']);
    });

    Route::prefix('stats')->group(function () {
        Route::get('mesStats/', [VendeurStatsController::class, 'mesStats']);
    });

    // Routes pour les interactions (favoris et alertes)
    Route::prefix('interactions')->group(function () {
        Route::get('/favorites', [InteractionController::class, 'Favoirites']);
        Route::get('/alerts', [InteractionController::class, 'Alerts']);
        Route::get('/mesUtilisateursBloques', [InteractionController::class, 'mesUtilisateursBloques']);
        Route::get('/{id}/alert', [InteractionController::class, 'detailAlerte']);
        Route::post('/addAlert', [InteractionController::class, 'storeAlert']);
        Route::post('/addFavorite', [InteractionController::class, 'storeFavorite']);
        Route::post('/signalerUser', [InteractionController::class, 'signalerUser']);
        Route::post('/bloquerUser', [InteractionController::class, 'bloquerUser']);
        Route::delete('/debloquerUser/{userId}', [InteractionController::class, 'debloquerUser']);
        Route::delete('/deleteFavorite/{postId}', [InteractionController::class, 'deleteFavorite']);
    });

    Route::prefix('transactions')->group(function () {
        Route::get('/mesRdv', [TransactionController::class, 'mesRdv']);
        Route::get('/nosRdv', [TransactionController::class, 'nosRdv']);
        Route::post('/storeTransaction', [TransactionController::class, 'storeRdv']);
        Route::post('/annulerRdv/{id}', [TransactionController::class, 'annulerRdv']);
        Route::post('/annulerMonRdv/{id}', [TransactionController::class, 'annulerMonRdv']);
        Route::post('/annulerRdv', [TransactionController::class, 'annulerRdv']);
    });

    Route::prefix('notifications')->group(function () {
        Route::get('mesNotifs', [NotificationsController::class, 'index']);
        Route::post('markAsRead/{id}', [NotificationsController::class, 'markAsRead']);
        Route::post('markAsAllRead', [NotificationsController::class, 'markAsAllRead']);
    });

    Route::middleware(['role:admin'])->prefix('moderations')->group(function () {
        Route::get('/allModerations', [moderationsController::class, 'getAllModerations']);
        Route::get('/moderation/{id}', [moderationsController::class, 'getDetailModeration']);
        Route::post('/suspendrePost', [moderationsController::class, 'suspendrePost']);
        Route::post('/restaurPost', [moderationsController::class, 'Restauration']);
        Route::post('/suspendreCompte', [moderationsController::class, 'suspendreCompte']);
        Route::post('/bannirCompte', [moderationsController::class, 'bannirCompte']);
    });
});
