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

// Canal privé par utilisateur : utilisé par DataRefresh pour les mises à jour temps réel.
// Le frontend écoute `private-user.{id}` via le hook useDataRefresh.
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal privé d'une conversation : seuls les deux participants sont autorisés.
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = \App\Models\Conversation::find($conversationId);
    if (!$conversation) return false;
    return $conversation->participant_1_id === $user->id
        || $conversation->participant_2_id === $user->id;
});