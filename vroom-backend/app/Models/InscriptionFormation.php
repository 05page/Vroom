<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InscriptionFormation extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'inscriptions_formation';

    protected $fillable = [
        'client_id', 'formation_id', 'date_inscription',
        'statut_eleve', 'date_examen', 'reussite',
    ];

    protected $casts = [
        'date_inscription' => 'datetime',
        'date_examen'      => 'date',
        'reussite'         => 'boolean',
    ];

    const STATUT_INSCRIT       = 'inscrit';
    const STATUT_EN_COURS      = 'en_cours';
    const STATUT_EXAMEN_PASSE  = 'examen_passe';
    const STATUT_TERMINE       = 'terminé';
    const STATUT_ABANDONNE     = 'abandonné';

    public function client()    { return $this->belongsTo(User::class, 'client_id'); }
    public function formation() { return $this->belongsTo(Formation::class, 'formation_id'); }
}
