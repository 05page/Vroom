<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Favori extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'vehicule_id', 'date_ajout'];

    protected $casts = ['date_ajout' => 'datetime'];

    public function user()     { return $this->belongsTo(User::class, 'user_id'); }
    public function vehicule() { return $this->belongsTo(Vehicules::class, 'vehicule_id'); }
}
