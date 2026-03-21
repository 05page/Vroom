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

    // Statuts gérés par l'élève
    const STATUT_PREINSCRIT         = 'préinscrit';       // statut initial à la création

    // Statuts gérés par l'auto-école
    const STATUT_PAIEMENT_EN_COURS  = 'paiement_en_cours'; // dossier pris en charge → annulation bloquée
    const STATUT_INSCRIT            = 'inscrit';            // paiement soldé → inscription officielle
    const STATUT_EN_COURS           = 'en_cours';
    const STATUT_EXAMEN_PASSE       = 'examen_passe';
    const STATUT_TERMINE            = 'terminé';
    const STATUT_ABANDONNE          = 'abandonné';

    /** Retourne true si l'élève ne peut plus annuler sa préinscription. */
    public function annulationBloquee(): bool
    {
        return $this->statut_eleve !== self::STATUT_PREINSCRIT;
    }

    public function client()      { return $this->belongsTo(User::class, 'client_id'); }
    public function formation()   { return $this->belongsTo(Formation::class, 'formation_id'); }
    public function versements()  { return $this->hasMany(VersementInscription::class, 'inscription_id'); }

    /** Somme de tous les versements enregistrés pour cette inscription. */
    public function getMontantPayeAttribute(): float
    {
        return (float) $this->versements()->sum('montant');
    }
}
