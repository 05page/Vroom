<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle pour les tickets de support.
 *
 * Statuts possibles : ouvert → en_cours → résolu / fermé
 * Chaque ticket est créé par un utilisateur et peut recevoir
 * une réponse d'un admin.
 */
class SupportTicket extends Model
{
    use HasUuids;

    protected $table = 'support_tickets';

    // UUID, pas d'auto-increment
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'sujet',
        'message',
        'statut',
        'priorite',
        'reponse_admin',
        'admin_id',
        'repondu_at',
    ];

    protected $casts = [
        'repondu_at' => 'datetime',
    ];

    // ── Constantes de statut ──────────────────────────────────
    const STATUT_OUVERT   = 'ouvert';
    const STATUT_EN_COURS = 'en_cours';
    const STATUT_RESOLU   = 'résolu';
    const STATUT_FERME    = 'fermé';

    // ── Relations ─────────────────────────────────────────────

    /** L'utilisateur qui a créé le ticket */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** L'admin qui a répondu (nullable) */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
