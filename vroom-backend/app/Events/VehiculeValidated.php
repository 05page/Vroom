<?php

namespace App\Events;

use App\Models\Vehicules;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event déclenché quand un véhicule est validé par l'admin.
 * Utilise ShouldBroadcastNow pour bypasser la queue (QUEUE_CONNECTION=database).
 * Canal public : pas besoin d'authentification, tout le monde peut recevoir.
 */
class VehiculeValidated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * On injecte le véhicule complet (avec ses relations déjà chargées).
     */
    public function __construct(public Vehicules $vehicule)
    {
        //
    }

    /**
     * Canal public "vehicules" — pas de "private-" devant, donc aucune auth requise.
     * Tous les visiteurs de la page /vehicles reçoivent l'événement.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('vehicules'),
        ];
    }

    /**
     * Données envoyées au frontend.
     * On charge creator, description et photos si pas encore chargés.
     */
    public function broadcastWith(): array
    {
        $this->vehicule->loadMissing(['creator:id,fullname,email,role', 'description', 'photos']);

        return [
            'vehicule' => $this->vehicule->toArray(),
        ];
    }

    /**
     * Nom de l'événement côté frontend : ".vehicule.validated"
     * Le point devant indique à Echo que c'est un event custom (pas prefixé par le namespace Laravel).
     */
    public function broadcastAs(): string
    {
        return 'vehicule.validated';
    }
}
