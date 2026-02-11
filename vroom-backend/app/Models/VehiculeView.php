<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehiculeView extends Model
{
    //
    protected $table = "vehicule_views";

    protected $fillable = ['user_id', 'vehicule_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicule()
    {
        return $this->belongsTo(Vehicules::class);
    }
}
