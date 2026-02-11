<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Notifications;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpParser\JsonDecoder;

class NotificationsController extends Controller
{
    //
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            $notifications = Notifications::where('recever_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($notifications->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Aucune notification trouvée pour cet utilisateur',
                    'data' => [],
                ], 200);
            }

            $unreadCount = Notifications::where('recever_id', $user->id)
                ->noRead()
                ->count();

            $notifs = [
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ];
            return response()->json([
                'success' => true,
                'data' => $notifs,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function markAsRead($id): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            $notification = Notifications::where('id', $id)
                ->where('recever_id', $user->id)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification introuvable',
                ], 404);
            }

            if ($notification->is_read) {
                return response()->json([
                    'success' => true,
                    'message' => 'Déjà marqué comme lu',
                ], 200);
            }
            $notification->markAsRead();
            return response()->json([
                'success' => true,
                'message' => 'Marqué comme lu',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la notification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function markAllAsRead() :JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            $notification = Notifications::where('id', $user->id)->where('recever_id', $user->id)->first();
            if(!$notification){
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune notification trouvée pour cet utilisateur',
                ], 404);
            }
            $unreadNotifications = Notifications::where('recever_id', $user->id)
                ->noRead()
                ->get();

            if ($unreadNotifications->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Aucune notification non lue à marquer comme lue',
                ], 200);
            }

            foreach ($unreadNotifications as $notification) {
                $notification->markAsRead();
            }

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications  été marquées comme lues',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
