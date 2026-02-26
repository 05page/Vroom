<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Alerte extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id', 'marque_cible', 'modele_cible', 'prix_max', 'carburant', 'active',
    ];

    protected $casts = [
        'active'   => 'boolean',
        'prix_max' => 'decimal:2',
    ];

    public function user() { return $this->belongsTo(User::class, 'user_id'); }

    public function scopeActive($query)   { return $query->where('active', true); }
    public function scopeInactive($query) { return $query->where('active', false); }
}
