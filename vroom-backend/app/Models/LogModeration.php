<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LogModeration extends Model
{
    use HasUuids;

    protected $table = 'logs_moderation';

    protected $fillable = [
        'admin_id', 'action', 'cible_type', 'id_cible', 'details', 'date_action',
    ];

    protected $casts = ['date_action' => 'datetime'];

    // Pas de soft delete — journal d'audit immuable

    public function admin() { return $this->belongsTo(User::class, 'admin_id'); }

    public static function enregistrer(User $admin, string $action, string $cibleType, string $idCible, ?string $details = null): self
    {
        return self::create([
            'admin_id'    => $admin->id,
            'action'      => $action,
            'cible_type'  => $cibleType,
            'id_cible'    => $idCible,
            'details'     => $details,
            'date_action' => now(),
        ]);
    }
}
