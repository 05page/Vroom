<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * DataRefresh
 *
 * Event broadcasté en temps réel vers un utilisateur spécifique
 * pour lui signaler qu'une de ses données a changé côté backend.
 *
 * Usage dans un controller :
 *   event(new DataRefresh($userId, 'rdv'));
 *   event(new DataRefresh($userId, 'transaction'));
 *
 * Types disponibles : rdv | formation | vehicule | transaction | crm | message
 *
 * Côté frontend, le hook useDataRefresh écoute ce canal et appelle
 * le callback de refresh correspondant au type.
 */
class DataRefresh implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param int|string $userId  L'ID de l'utilisateur destinataire
     * @param string     $type    Le type de données à rafraîchir
     */
    public function __construct(
        public readonly int|string $userId,
        public readonly string $type,
    ) {}

    /**
     * Canal privé : seul l'utilisateur concerné peut recevoir cet event.
     * La règle d'autorisation est définie dans routes/channels.php.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    /**
     * Payload envoyé au client WebSocket.
     * Le frontend lit `payload.type` pour décider quelle donnée recharger.
     */
    public function broadcastWith(): array
    {
        return [
            'type' => $this->type,
        ];
    }

    /**
     * Nom de l'event tel qu'il est reçu côté Echo.
     * Le point devant le nom indique un event sans namespace Laravel.
     */
    public function broadcastAs(): string
    {
        return 'data.refresh';
    }
}
