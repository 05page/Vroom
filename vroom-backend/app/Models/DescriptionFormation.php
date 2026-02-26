<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DescriptionFormation extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'descriptions_formation';

    protected $fillable = ['formation_id', 'titre', 'texte', 'langue'];

    public function formation() { return $this->belongsTo(Formation::class, 'formation_id'); }
}
