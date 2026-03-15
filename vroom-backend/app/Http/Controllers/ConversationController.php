<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Messages;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    /**
     * GET /conversations
     *
     * Liste toutes les conversations de l'utilisateur connecté,
     * triées par dernier message (plus récent en premier).
     * Chaque conversation inclut : dernier message, véhicule, l'autre participant,
     * et le nombre de messages non lus.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $conversations = Conversation::where('participant_1_id', $userId)
            ->orWhere('participant_2_id', $userId)
            ->with([
                'vehicule',
                'vehicule.description:vehicule_id,marque,modele',
                'vehicule.photos' => fn($q) => $q->orderBy('position'),
                'participant1:id,fullname,avatar,role',
                'participant2:id,fullname,avatar,role',
            ])
            ->orderBy('last_message_at', 'desc')
            ->get();

        $conversationIds = $conversations->pluck('id')->toArray();

        // DISTINCT ON (PostgreSQL) : récupère le dernier message par conversation
        // en une seule requête — évite MAX(uuid) incompatible avec Eloquent ofMany.
        $lastMessages = empty($conversationIds)
            ? collect()
            : Messages::selectRaw('DISTINCT ON (conversation_id) *')
                ->whereIn('conversation_id', $conversationIds)
                ->orderBy('conversation_id')
                ->orderByDesc('created_at')
                ->get()
                ->keyBy('conversation_id');

        $conversations = $conversations->map(function (Conversation $conv) use ($userId, $lastMessages) {
                $otherParticipant = $conv->participant_1_id === $userId
                    ? $conv->participant2
                    : $conv->participant1;

                $unreadCount = Messages::where('conversation_id', $conv->id)
                    ->where('sender_id', '!=', $userId)
                    ->where('is_read', false)
                    ->count();

                $v = $conv->vehicule;

                return [
                    'id'               => $conv->id,
                    'vehicule'         => $v ? [
                        'id'          => $v->id,
                        'description' => $v->description,
                        'photos'      => $v->photos,
                    ] : null,
                    'other_participant' => $otherParticipant,
                    'last_message'     => $lastMessages->get($conv->id),
                    'last_message_at'  => $conv->last_message_at,
                    'unread_count'     => $unreadCount,
                ];
            })->values();

        return response()->json(['success' => true, 'data' => ['conversations' => $conversations]]);
    }

    /**
     * POST /conversations
     *
     * Cherche une conversation existante entre l'user connecté et other_user_id
     * pour le véhicule donné, ou en crée une nouvelle.
     */
    public function findOrCreate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'other_user_id' => 'required|uuid|exists:users,id',
            'vehicule_id'   => 'required|uuid|exists:vehicules,id',
        ]);

        $currentUser = $request->user();
        $otherUser   = User::findOrFail($validated['other_user_id']);

        // Empêcher de créer une conversation avec soi-même
        if ($currentUser->id === $otherUser->id) {
            return response()->json([
                'message' => 'Impossible de créer une conversation avec vous-même.',
            ], 422);
        }

        $conversation = Conversation::findOrCreateBetween(
            $currentUser,
            $otherUser,
            $validated['vehicule_id']
        );

        $conversation->load([
            'participant1:id,fullname,avatar,role',
            'participant2:id,fullname,avatar,role',
            'vehicule',
            'vehicule.description:vehicule_id,marque,modele',
            'vehicule.photos' => fn($q) => $q->orderBy('position'),
        ]);

        return response()->json(['success' => true, 'data' => $conversation], 201);
    }

    /**
     * GET /conversations/{id}/messages
     *
     * Retourne les messages paginés d'une conversation (50 par page, plus récents d'abord).
     * Seuls les participants de la conversation y ont accès.
     */
    public function messages(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);
        $userId       = $request->user()->id;

        // Vérifier que l'utilisateur est bien participant
        if (!$this->isParticipant($conversation, $userId)) {
            return response()->json([
                'message' => 'Vous n\'êtes pas participant de cette conversation.',
            ], 403);
        }

        $messages = Messages::where('conversation_id', $id)
            ->with('sender:id,fullname,avatar')
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json(['success' => true, 'data' => ['messages' => $messages->items()]]);
    }

    /**
     * POST /conversations/{id}/messages
     *
     * Envoie un message texte dans la conversation.
     * Met à jour last_message_at et broadcast l'event MessageSent.
     */
    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);
        $userId       = $request->user()->id;

        if (!$this->isParticipant($conversation, $userId)) {
            return response()->json([
                'message' => 'Vous n\'êtes pas participant de cette conversation.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        // Déterminer le destinataire (l'autre participant)
        $receiverId = $conversation->getOtherParticipantId($userId);

        $message = Messages::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $userId,
            'receiver_id'     => $receiverId,
            'vehicule_id'     => $conversation->vehicule_id,
            'type'            => 'text',
            'content'         => $validated['content'],
            'is_read'         => false,
        ]);

        // Mettre à jour le timestamp du dernier message
        $conversation->update(['last_message_at' => Carbon::now()]);

        $message->load('sender:id,fullname,avatar');

        // Broadcast best-effort : ne bloque pas la réponse si Reverb est éteint
        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Throwable) {}

        return response()->json(['success' => true, 'data' => $message], 201);
    }

    public function updateMessage(Request $request, string $conversationId, string $messageId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        $userId = $request->user()->id;
        $message = Messages::findOrFail($messageId);
        if ($message->sender_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => "Seul l'auteur peut modifier ce message"
            ], 403);
        }
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $message->update([
            'content' => $validated['content'],
        ]);

        $conversation->update(['last_message_at' => Carbon::now()]);

        $message->load('sender:id,fullname,avatar');

        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Throwable) {}

        return response()->json(['success' => true, 'data' => $message], 201);
    }

    /**
     * POST /conversations/{id}/read
     *
     * Marque comme lus tous les messages non lus de la conversation
     * envoyés par l'autre participant (pas les siens).
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);
        $userId  = $request->user()->id;

        if (!$this->isParticipant($conversation, $userId)) {
            return response()->json([
                'message' => 'Vous n\'êtes pas participant de cette conversation.',
            ], 403);
        }

        $updated = Messages::where('conversation_id', $id)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);

        return response()->json([
            'message'       => 'Messages marqués comme lus.',
            'updated_count' => $updated,
        ]);
    }

    /**
     * Vérifie si un utilisateur est participant de la conversation.
     *
     * @param  Conversation $conversation
     * @param  string       $userId       UUID de l'utilisateur
     * @return bool
     */
    private function isParticipant(Conversation $conversation, string $userId): bool
    {
        return $conversation->participant_1_id === $userId
            || $conversation->participant_2_id === $userId;
    }
}
