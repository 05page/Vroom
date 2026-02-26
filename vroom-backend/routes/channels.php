<?php

use Illuminate\Support\Facades\Broadcast;

// Enregistre la route /broadcasting/auth avec Sanctum au lieu du middleware "web" par défaut.
// Sans ça, Laravel refuse les tokens Bearer et retourne 403.
Broadcast::routes(['middleware' => ['auth:sanctum']]);

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('notifications.{userId}', function($user, $userId){
    return $user->id === $userId;
});