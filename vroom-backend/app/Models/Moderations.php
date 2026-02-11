<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Moderations extends Model
{
    //
    protected $fillable = [
        'moderatable_type',
        'moderable_id',
        'admin_id',
        'action',
        'motif',
        'description',
        'status',
        'decision_at',
        'expire_at'
    ];

    const ACTION_VALIDATION = "validation";
    const ACTION_RETRAIT = "retrait";
    const ACTION_RESTAURATION  = "restauration";
    const ACTION_SUSPENSION = "suspension";
    const ACTION_BANNISSEMENT = "bannissement";
    const ACTION_REJET = "rejet";

    const MOTIF_ARNAQUE = "arnaque";
    const MOTIF_CONTENU = "contenu_illicite";
    const MOTIF = "prix_suspect";
    const USURPATION = "usurpation_identite";
    const SIGNALEMENT = "signalements_multiples";
    const NON_CONFORMITE = "non_conformite";
    const AUTRE = "autre";

    // Relation polymorphique
    public function moderatable()
    {
        return $this->morphTo('moderatable', 'moderatable_type', 'moderable_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicules::class);
    }

    public function alertes(): BelongsTo
    {
        return $this->belongsTo(Interactions::class);
    }

    //Scopes
    public function scopeActionValidation($query)
    {
        return $query->where('action', 'validation');
    }

    public function scopeActionRetrait($query)
    {
        return $query->where('action', 'retrait');
    }

    public function scopeActionRestauration($query)
    {
        return $query->where('action', 'restauration');
    }

    public function scopeActionSuspension($query)
    {
        return $query->where('action', 'suspension');
    }

    public function scopeActionBanissement($query)
    {
        return $query->where('action', 'banissement');
    }

    public function scopeActionRejet($query)
    {
        return $query->where('action', 'rejet');
    }

    public function scopeEnCours($query)
    {
        return $query->where('status', 'en_cours');
    }

    public function scopeDecisionFinale($query)
    {
        return $query->where('status', 'decision_finale');
    }

    public function scopeLevee($query)
    {
        return $query->where('status', 'levee');
    }

    public function scopeMotifArnaque($query)
    {
        return $query->where('motif', 'arnaque');
    }

    // public function scopeExpired($query)
    // {
    //     return $query->where('expire_at', '<', now());
    // }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->where('expire_at', '>=', now())->orWhereNull('expire_at');
        });
    }

    public function scopeRecentDecisions($query, $days = 30)
    {
        return $query->where('decision_at', '>=', now()->subDays($days));
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function isAlreadyValidated(): bool
    {
        return $this->action === self::ACTION_VALIDATION
            && $this->status === 'decision_finale';
    }

    public function isAlreadyRetired(): bool
    {
        return $this->action === self::ACTION_RETRAIT
            && $this->status === 'decision_finale';
    }

    public function isAlreadyRestored(): bool
    {
        return $this->action === self::ACTION_RESTAURATION
            && $this->status === 'decision_finale';
    }

    public function isAlreadySuspended(): bool
    {
        return $this->action === self::ACTION_SUSPENSION
            && $this->status === 'decision_finale';
    }

    public function isRemoved(): bool
    {
        return $this->status === 'retire';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspendu';
    }

    // Méthodes pour marquer les actions de modération
    public function markAsValidation($motif = null, $description = null, $expireAt = null)
    {
        if ($this->isRemoved()) {
            throw new \LogicException('Impossible de valider un post retiré.');
        }

        if ($this->isSuspended()) {
            throw new \LogicException('Impossible de valider un post suspendu.');
        }

        if ($this->isAlreadyValidated()) {
            throw new \LogicException('Ce post est déjà validé.');
        }

        $this->action = self::ACTION_VALIDATION;
        $this->status = 'decision_finale';
        $this->decision_at = now();
        if ($motif) $this->motif = $motif;
        if ($description) $this->description = $description;
        if ($expireAt) $this->expire_at = $expireAt;
        $this->save();
    }

    public function markAsRetrait($motif = null, $description = null, $expireAt = null)
    {
        if ($this->isAlreadyRetired()) {
            throw new \LogicException('Ce post est déjà retiré.');
        }
        $this->action = self::ACTION_RETRAIT;
        $this->status = 'decision_finale';
        $this->decision_at = now();
        if ($motif) $this->motif = $motif;
        if ($description) $this->description = $description;
        if ($expireAt) $this->expire_at = $expireAt;
        $this->save();
    }

    public function markAsRestauration($motif = null, $description = null, $expireAt = null)
    {
        // ✅ Enlève la vérification "isRemoved" car on veut justement restaurer
        if ($this->action === self::ACTION_RESTAURATION && $this->status === 'decision_finale') {
            throw new \LogicException('Ce post est déjà restauré.');
        }

        $this->action = self::ACTION_RESTAURATION;
        $this->status = 'decision_finale';
        $this->decision_at = now();
        if ($motif) $this->motif = $motif;
        if ($description) $this->description = $description;
        if ($expireAt) $this->expire_at = $expireAt;
        $this->save();
    }

    public function markAsSuspension($motif = null, $description = null, $expireAt = null)
    {
        if ($this->isRemoved()) {
            throw new \LogicException('Impossible de suspendre un post déjà retiré.');
        }

        if ($this->isAlreadySuspended()) {
            throw new \LogicException("Ce post est déjà suspendu");
        }
        $this->action = self::ACTION_SUSPENSION;
        $this->status = 'decision_finale';
        $this->decision_at = now();
        if ($motif) $this->motif = $motif;
        if ($description) $this->description = $description;
        if ($expireAt) $this->expire_at = $expireAt;
        $this->save();
    }

    public function markAsBannissement($motif = null, $description = null, $expireAt = null)
    {
        $this->action = self::ACTION_BANNISSEMENT;
        $this->status = 'decision_finale';
        $this->decision_at = now();
        if ($motif) $this->motif = $motif;
        if ($description) $this->description = $description;
        if ($expireAt) $this->expire_at = $expireAt;
        $this->save();
    }

    public function markAsRejet($motif = null, $description = null, $expireAt = null)
    {
        $this->action = self::ACTION_REJET;
        $this->status = 'decision_finale';
        $this->decision_at = now();
        if ($motif) $this->motif = $motif;
        if ($description) $this->description = $description;
        if ($expireAt) $this->expire_at = $expireAt;
        $this->save();
    }

    // Méthode pour lever une modération (par exemple, annuler une suspension)
    public function leverModeration()
    {
        $this->status = 'levee';
        $this->save();
    }
}
