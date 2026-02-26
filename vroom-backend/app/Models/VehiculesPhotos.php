<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehiculesPhotos extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'vehicules_photos';

    protected $fillable = ['vehicule_id', 'path', 'is_primary', 'position'];

    protected $casts = ['is_primary' => 'boolean'];

    public function vehicule()
    {
        return $this->belongsTo(Vehicules::class, 'vehicule_id');
    }
}
