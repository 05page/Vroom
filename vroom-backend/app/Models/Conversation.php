<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasUuids;

    protected $fillable = [
        'participant_1_id',
        'participant_2_id',
        'vehicule_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    // ── Relations ────────────────────────────────────────────

    public function participant1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_1_id');
    }

    public function participant2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_2_id');
    }

    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicules::class, 'vehicule_id');
    }

    /**
     * Tous les messages de la conversation, triés du plus ancien au plus récent.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Messages::class, 'conversation_id')
                    ->orderBy('created_at', 'asc');
    }

    /**
     * Le dernier message envoyé dans la conversation.
     */
    /**
     * NE PAS utiliser en eager loading : MAX(uuid) incompatible avec PostgreSQL.
     * Utiliser ConversationController::lastMessages() avec DISTINCT ON à la place.
     */
    public function lastMessage(): HasOne
    {
        return $this->hasOne(Messages::class, 'conversation_id')
                    ->orderByDesc('created_at');
    }

    // ── Méthodes utilitaires ─────────────────────────────────

    /**
     * Cherche une conversation existante entre deux utilisateurs pour un véhicule donné,
     * ou en crée une nouvelle si elle n'existe pas.
     *
     * L'ordre des participants n'a pas d'importance : on normalise en plaçant
     * le plus petit UUID en participant_1_id pour garantir l'unicité de la contrainte.
     *
     * @param  User   $user1       Premier participant
     * @param  User   $user2       Second participant
     * @param  string $vehiculeId  UUID du véhicule concerné
     * @return self
     */
    public static function findOrCreateBetween(User $user1, User $user2, string $vehiculeId): self
    {
        // Normaliser l'ordre pour respecter la contrainte unique :
        // le UUID le plus petit va toujours en participant_1_id
        [$p1, $p2] = strcmp($user1->id, $user2->id) < 0
            ? [$user1->id, $user2->id]
            : [$user2->id, $user1->id];

        return self::firstOrCreate(
            [
                'participant_1_id' => $p1,
                'participant_2_id' => $p2,
                'vehicule_id'      => $vehiculeId,
            ]
        );
    }

    /**
     * Retourne l'ID de l'autre participant par rapport à l'utilisateur donné.
     *
     * @param  string $userId  UUID de l'utilisateur courant
     * @return string          UUID de l'autre participant
     */
    public function getOtherParticipantId(string $userId): string
    {
        return $this->participant_1_id === $userId
            ? $this->participant_2_id
            : $this->participant_1_id;
    }
}
