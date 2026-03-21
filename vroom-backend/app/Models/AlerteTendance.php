<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Mémorise les tranches de tendance déjà notifiées pour éviter le spam.
 *
 * Une ligne = "pour ce véhicule/formation, cette tranche, cette période,
 *              on a déjà envoyé une notification à notified_at."
 *
 * Logique de reset :
 *  - quotidien  → on cherche une entrée depuis today()->startOfDay()
 *  - hebdomadaire → on cherche une entrée depuis la semaine en cours (lundi)
 */
class AlerteTendance extends Model
{
    use HasUuids;

    protected $table = 'alertes_tendance';

    public $timestamps = false; // seulement notified_at, pas updated_at

    protected $fillable = [
        'vehicule_id',
        'formation_id',
        'type',
        'periode',
        'tranche',
        'notified_at',
    ];

    protected $casts = [
        'notified_at' => 'datetime',
        'tranche'     => 'integer',
    ];

    // ── Relations ─────────────────────────────────────────────────────────────

    public function vehicule()
    {
        return $this->belongsTo(Vehicules::class, 'vehicule_id');
    }

    public function formation()
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }
}
