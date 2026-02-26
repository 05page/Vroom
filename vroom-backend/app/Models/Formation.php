<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Formation extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'auto_ecole_id', 'type_permis', 'prix', 'duree_heures', 'statut_validation',
    ];

    protected $casts = ['prix' => 'decimal:2'];

    const STATUT_EN_ATTENTE = 'en_attente';
    const STATUT_VALIDE     = 'validé';
    const STATUT_REJETE     = 'rejeté';

    public function autoEcole()    { return $this->belongsTo(User::class, 'auto_ecole_id'); }
    public function description()  { return $this->hasOne(DescriptionFormation::class, 'formation_id'); }
    public function inscriptions() { return $this->hasMany(InscriptionFormation::class, 'formation_id'); }
}
