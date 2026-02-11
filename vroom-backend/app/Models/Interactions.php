<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interactions extends Model
{
    //
    protected $table = 'interactions';
    protected $fillable = [
        'user_id',
        'post_id',
        'user_signal_id',
        'type',
        'justification_alerte',
        'description_alerte',
        'status_alerte',
    ];

    const TYPE_ALERTE = 'alerte';
    const TYPE_FAVORI = 'favori';
    const TYPE_SIGNALEMENT_USER = 'signalement_user';
    const TYPE_BLOCAGE_USER = 'blocage_user';

    const STATUT_EN_ATTENTE = 'en_attente';
    const STATUT_EXAMINEE = 'examinee';
    const STATUT_REJETEE = 'rejetee';

    // Définir les relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Vehicules::class, 'post_id');
    }

    public function userSignale(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_signal_id');
    }

    //scopes pour filtrer les interactions par type
    public function scopeSignalementsUser($query)
    {
        return $query->where('type', self::TYPE_SIGNALEMENT_USER);
    }

    public function scopeBlocagesUser($query)
    {
        return $query->where('type', self::TYPE_BLOCAGE_USER);
    }
    public function scopeFavorites($query)
    {
        return $query->where('type', 'favori');
    }
    public function scopeAlerts($query)
    {
        return $query->where('type', 'alerte');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('status_alerte', self::STATUT_EN_ATTENTE);
    }
    public function scopeExaminee($query)
    {
        return $query->where('status_alerte', self::STATUT_EXAMINEE);
    }
    public function scopeRejetee($query)
    {
        return $query->where('status_alerte', self::STATUT_REJETEE);
    }
}
