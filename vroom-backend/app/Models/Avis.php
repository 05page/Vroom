<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Avis extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'client_id', 'vendeur_id', 'auto_ecole_id', 'note', 'commentaire', 'date_avis',
    ];

    protected $casts = ['date_avis' => 'datetime'];

    public function client()    { return $this->belongsTo(User::class, 'client_id'); }
    public function vendeur()   { return $this->belongsTo(User::class, 'vendeur_id'); }
    public function autoEcole() { return $this->belongsTo(User::class, 'auto_ecole_id'); }
}
