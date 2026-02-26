<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PosteVendeur extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'postes_vendeur';

    protected $fillable = [
        'abonnement_id', 'vendeur_id', 'user_id',
        'nom_poste', 'email_poste', 'role_poste', 'actif',
    ];

    protected $casts = ['actif' => 'boolean'];

    const ROLE_GESTIONNAIRE = 'gestionnaire';
    const ROLE_COMMERCIAL   = 'commercial';
    const ROLE_COMPTABLE    = 'comptable';

    public function abonnement() { return $this->belongsTo(Abonnement::class, 'abonnement_id'); }
    public function vendeur()    { return $this->belongsTo(User::class, 'vendeur_id'); }
    public function user()       { return $this->belongsTo(User::class, 'user_id'); }
}
