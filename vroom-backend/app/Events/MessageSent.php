<?php

namespace App\Events;

use App\Models\Messages;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param Messages $message Le message qui vient d'être envoyé
     */
    public function __construct(public Messages $message)
    {
        //
    }

    /**
     * Canal privé lié à la conversation.
     * Seuls les participants de la conversation y sont abonnés côté frontend.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    /**
     * Données envoyées au client via le WebSocket.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id'              => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_id'       => $this->message->sender_id,
                'receiver_id'     => $this->message->receiver_id,
                'type'            => $this->message->type,
                'content'         => $this->message->content,
                'is_read'         => $this->message->is_read,
                'created_at'      => $this->message->created_at->toISOString(),
                'sender'          => [
                    'id'       => $this->message->sender->id,
                    'fullname' => $this->message->sender->fullname,
                    'avatar'   => $this->message->sender->avatar,
                ],
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
