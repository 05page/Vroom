<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

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

    public function participant1()
    {
        return $this->belongsTo(User::class, 'participant_1_id');
    }

    public function participant2()
    {
        return $this->belongsTo(User::class, 'participant_2_id');
    }

    public function vehicule()
    {
        return $this->belongsTo(Vehicules::class, 'vehicule_id');
    }

    public function messages()
    {
        return $this->hasMany(Messages::class, 'conversation_id');
    }

    // ── Scopes ───────────────────────────────────────────────

    /**
     * Scope : conversations ou l'user authentifie est participant (p1 ou p2).
     *
     * Usage : Conversation::forUser($userId)->get()
     */
    public function scopeForUser($query, string $userId)
    {
        return $query->where('participant_1_id', $userId)
                     ->orWhere('participant_2_id', $userId);
    }
}
