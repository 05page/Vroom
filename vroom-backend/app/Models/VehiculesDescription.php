<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehiculesDescription extends Model
{
    //
    protected $table = 'vehicules_description';
    protected $fillable = [
        'vehicule_id',
        'marque',
        'modele',
        'annee',
        'carburant',
        'transmission',
        'kilometrage',
        'couleur',
        'nombre_portes',
        'nombre_places',
        'visite_technique',
        'date_visite_technique',
        'carte_grise',
        'date_carte_grise',
        'assurance',
        'historique_accidents',
        'equipements',  
    ];

    protected $casts = [
        'equipements' => 'array',
        'date_visite_technique' => 'date',
        'date_carte_grise' => 'date',
    ];

    //Relations
    public function vehicule()
    {
        return $this->belongsTo(Vehicules::class, 'vehicule_id'); 
    }

    
    
}

