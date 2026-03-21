<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class VersementInscription extends Model
{
    use HasUuids;

    protected $table = 'versements_inscription';

    protected $fillable = ['inscription_id', 'montant', 'date_versement', 'note'];

    protected $casts = [
        'montant'         => 'decimal:2',
        'date_versement'  => 'date',
    ];

    /** L'inscription à laquelle appartient ce versement. */
    public function inscription()
    {
        return $this->belongsTo(InscriptionFormation::class, 'inscription_id');
    }
}
