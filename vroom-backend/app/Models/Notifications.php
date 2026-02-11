<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifications extends Model
{
    //
    protected $fillable = [
        'recever_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at'
    ];

    const TYPE_INFO = 'info';
    const TYPE_ERROR = "erreur";
    const TYPE_ALERT = 'alert';
    const TYPE_WARNING = "attente";
    const TYPE_SUCCESS = 'success';
    const TYPE_MESSAGE = 'message';

    //Relations
    public function recever()
    {
        return $this->belongsTo(User::class, 'recever_id');
    }

    public static function types() //cette fonction retourne les types de notifications disponibles(on utilisera cette fonction pour valider les types lors de la création d'une notification) (statique car elle n'a pas besoin d'une instance de la classe)
    {
        return [
            self::TYPE_INFO,
            self::TYPE_ALERT,
            self::TYPE_ERROR,
            self::TYPE_WARNING,
            self::TYPE_SUCCESS,
            self::TYPE_MESSAGE,
        ];
    }

    //Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeNoRead($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, $userId) //scope pour filtrer les notifications d'un utilisateur spécifique
    {
        return $query->where('recever_id', $userId);
    }

    public function scopeOfType($query, $type) //scope pour filtrer les notifications par type
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    //Fonctions utilitaires(les fonction)
    public function markAsRead()
    {
        $this->is_read = true;
        $this->read_at = now();
        $this->save();
    }

    public function markAsUnread()
    {
        $this->is_read = false;
        $this->read_at = null;
        $this->save();
    }

    public function isRead(): bool
    {
        return $this->is_read;
    }

    public function isUnread(): bool
    {
        return !$this->is_read;
    }
    
    public function getNotifications(): array
    {
        return [
            'id' => $this->id,
            'recever_id' => $this->recever_id,
            'type' => $this->type,
            'message' => $this->message,
            'data' => $this->data,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

}
