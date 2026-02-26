<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Catalogue extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = ['user_id', 'nom_catalogue', 'description'];

    public function concessionnaire() { return $this->belongsTo(User::class, 'user_id'); }
    public function vehicules()       { return $this->hasMany(Vehicules::class, 'catalogue_id'); }
}
