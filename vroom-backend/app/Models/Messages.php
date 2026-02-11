<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    //
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'vehicule_id',
        'transaction_id',
        'type',
        'content',
        'audio_path',
        'duration',
        'is_read',
        'read_at'
    ];

    protected $casts = [

    ];  
    
    //Relations
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function vehicules()
    {
        return $this->belongsTo(Vehicules::class, 'vehicule_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transactions::class, 'transaction_id');
    }

    //Scopes
    public function scopeMessageRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeMessageUnread($query)
    {
        return $query->where('is_read', false);
    }

    //Méthodes 
}
