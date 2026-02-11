<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehiculesPhotos extends Model
{
    //
    protected $table = 'vehicules_photos';
    protected $fillable = [
        'vehicule_id',
        'path',
        'is_primary',
        'position',
    ];
    protected $casts = [
        'is_primary' => 'boolean',
    ];

    //Relations
    
}
