<?php

namespace Database\Factories;

use App\Models\RendezVous;
use App\Models\User;
use App\Models\Vehicules;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RendezVous>
 */
class RendezVousFactory extends Factory
{
    protected $model = RendezVous::class;

    public function definition(): array
    {
        return [
            'client_id'  => User::factory()->client(),
            'vendeur_id' => User::factory()->vendeur(),
            'vehicule_id'=> Vehicules::factory()->vente(),
            'date_heure' => fake()->dateTimeBetween('+1 day', '+1 month'),
            'type'       => fake()->randomElement([
                RendezVous::TYPE_VISITE,
                RendezVous::TYPE_ESSAI_ROUTIER,
                RendezVous::TYPE_PREMIERE_RENCONTRE,
            ]),
            'statut'     => RendezVous::STATUT_EN_ATTENTE,
            'motif'      => fake()->optional()->sentence(),
            'lieu'       => fake()->optional()->address(),
            'notes'      => fake()->optional()->sentence(),
        ];
    }

    /** RDV confirmé par le vendeur */
    public function confirme(): static
    {
        return $this->state(fn () => [
            'statut' => RendezVous::STATUT_CONFIRME,
        ]);
    }

    /** RDV terminé */
    public function termine(): static
    {
        return $this->state(fn () => [
            'statut' => RendezVous::STATUT_TERMINE,
        ]);
    }

    /** RDV annulé */
    public function annule(): static
    {
        return $this->state(fn () => [
            'statut' => RendezVous::STATUT_ANNULE,
        ]);
    }
}
