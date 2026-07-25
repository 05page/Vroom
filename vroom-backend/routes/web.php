<?php

use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;

Route::get('/', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/auth/google/redirect', [App\Http\Controllers\AuthController::class, 'redirect']);