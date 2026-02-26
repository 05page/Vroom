<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Signalement extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'client_id', 'admin_id', 'cible_user_id', 'cible_vehicule_id',
        'motif', 'description', 'statut', 'date_signalement',
    ];

    protected $casts = ['date_signalement' => 'datetime'];

    const STATUT_EN_ATTENTE = 'en_attente';
    const STATUT_TRAITE     = 'traité';
    const STATUT_REJETE     = 'rejeté';

    public function client()        { return $this->belongsTo(User::class, 'client_id'); }
    public function admin()         { return $this->belongsTo(User::class, 'admin_id'); }
    public function cibleUser()     { return $this->belongsTo(User::class, 'cible_user_id'); }
    public function cibleVehicule() { return $this->belongsTo(Vehicules::class, 'cible_vehicule_id'); }

    public function scopeEnAttente($query) { return $query->where('statut', self::STATUT_EN_ATTENTE); }
    public function scopeTraite($query)    { return $query->where('statut', self::STATUT_TRAITE); }

    public function traiter(): void { $this->statut = self::STATUT_TRAITE; $this->save(); }
    public function rejeter(): void { $this->statut = self::STATUT_REJETE; $this->save(); }
}
