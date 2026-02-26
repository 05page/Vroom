<?php

namespace App\Http\Controllers;

use App\Models\Notifications;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationsController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();

            $notifications = Notifications::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $unreadCount = Notifications::where('user_id', $user->id)
                ->unread()
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications,
                    'unread_count'  => $unreadCount,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notifications',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function markAsRead($id): JsonResponse
    {
        try {
            $user = Auth::user();

            $notification = Notifications::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            if ($notification->isRead()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Déjà marquée comme lue',
                ], 200);
            }

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notification introuvable',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function markAsAllRead(): JsonResponse
    {
        try {
            $user = Auth::user();

            $unread = Notifications::where('user_id', $user->id)
                ->unread()
                ->get();

            if ($unread->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Aucune notification non lue',
                ], 200);
            }

            $unread->each->markAsRead();

            return response()->json([
                'success' => true,
                'message' => $unread->count() . ' notification(s) marquée(s) comme lues',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des notifications',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
