<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StatistiqueVendeur extends Model
{
    use HasUuids;

    protected $table = 'statistiques_vendeur';

    protected $fillable = [
        'user_id', 'nb_vues_total', 'nb_rdv_total', 'nb_rdv_confirmes',
        'nb_annonces_actives', 'periode_debut', 'periode_fin', 'calcule_at',
    ];

    protected $casts = [
        'periode_debut' => 'date',
        'periode_fin'   => 'date',
        'calcule_at'    => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class, 'user_id'); }
}
