<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PlanAbonnement extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'plans_abonnement';

    protected $fillable = [
        'nom', 'description', 'cible', 'prix_mensuel', 'prix_annuel',
        'nb_postes_max', 'nb_annonces_max', 'nb_photos_max',
        'stats_avancees', 'badge_premium', 'boost_annonces',
        'acces_leads', 'support_prioritaire', 'actif',
    ];

    protected $casts = [
        'prix_mensuel'      => 'decimal:2',
        'prix_annuel'       => 'decimal:2',
        'stats_avancees'    => 'boolean',
        'badge_premium'     => 'boolean',
        'boost_annonces'    => 'boolean',
        'acces_leads'       => 'boolean',
        'support_prioritaire' => 'boolean',
        'actif'             => 'boolean',
    ];

    public function abonnements() { return $this->hasMany(Abonnement::class, 'plan_id'); }

    public function scopeActif($query)  { return $query->where('actif', true); }
    public function scopePourVendeur($query)        { return $query->where('cible', 'vendeur'); }
    public function scopePourConcessionnaire($query) { return $query->where('cible', 'concessionnaire'); }
    public function scopePourAutoEcole($query)      { return $query->where('cible', 'auto_ecole'); }
}
