<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CrmNote extends Model
{
    use HasUuids;

    protected $table = 'crm_notes';

    protected $fillable = ['vendeur_id', 'client_id', 'contenu'];

    public function vendeur() { return $this->belongsTo(User::class, 'vendeur_id'); }
    public function client()  { return $this->belongsTo(User::class, 'client_id'); }
}
