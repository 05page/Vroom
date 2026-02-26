<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PaiementAbonnement extends Model
{
    use HasUuids;

    protected $table = 'paiements_abonnement';

    protected $fillable = [
        'abonnement_id', 'date_paiement', 'montant',
        'methode', 'statut', 'reference_externe',
    ];

    protected $casts = [
        'date_paiement' => 'datetime',
        'montant'       => 'decimal:2',
    ];

    // Pas de soft delete — trace comptable permanente

    public function abonnement() { return $this->belongsTo(Abonnement::class, 'abonnement_id'); }

    public function scopeReussi($query)    { return $query->where('statut', 'réussi'); }
    public function scopeEnAttente($query) { return $query->where('statut', 'en_attente'); }
}
