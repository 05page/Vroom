<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    use HasUuids;

    protected $fillable = [
        'sender_id', 'receiver_id', 'vehicule_id', 'rdv_id',
        'type', 'content', 'audio_path', 'duration', 'is_read', 'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function sender()   { return $this->belongsTo(User::class, 'sender_id'); }
    public function receiver() { return $this->belongsTo(User::class, 'receiver_id'); }
    public function vehicule() { return $this->belongsTo(Vehicules::class, 'vehicule_id'); }
    public function rdv()      { return $this->belongsTo(RendezVous::class, 'rdv_id'); }

    public function scopeMessageRead($query)   { return $query->where('is_read', true); }
    public function scopeMessageUnread($query) { return $query->where('is_read', false); }
}
