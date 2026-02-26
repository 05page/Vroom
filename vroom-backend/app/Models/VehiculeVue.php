<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class VehiculeVue extends Model
{
    use HasUuids;

    protected $table = 'vehicule_vues';

    public $timestamps = false; // seulement created_at, géré par useCurrent()

    protected $fillable = [
        'vehicule_id',
        'user_id',
        'ip_address',
    ];

    public function vehicule() { return $this->belongsTo(Vehicules::class, 'vehicule_id'); }
    public function user()     { return $this->belongsTo(User::class, 'user_id'); }
}
