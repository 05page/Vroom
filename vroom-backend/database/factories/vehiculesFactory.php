<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vehicules;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicules>
 */
class VehiculesFactory extends Factory
{
    protected $model = Vehicules::class;

    public function definition(): array
    {
        return [
            'created_by'        => User::factory()->vendeur(),
            'post_type'         => fake()->randomElement([Vehicules::POST_TYPE_VENTE, Vehicules::POST_TYPE_LOCATION]),
            'type'              => fake()->randomElement([Vehicules::VEHICLE_TYPE_NEUF, Vehicules::VEHICLE_TYPE_OCCASION]),
            'statut'            => Vehicules::STATUS_DISPONIBLE,
            'status_validation' => Vehicules::STATUS_VALIDATED,
            'prix'              => fake()->numberBetween(500000, 50000000),
            'negociable'        => fake()->boolean(),
        ];
    }

    /** Véhicule en attente de validation admin */
    public function enAttente(): static
    {
        return $this->state(fn () => [
            'status_validation' => Vehicules::STATUS_PENDING,
        ]);
    }

    /** Véhicule de type vente */
    public function vente(): static
    {
        return $this->state(fn () => [
            'post_type' => Vehicules::POST_TYPE_VENTE,
        ]);
    }

    /** Véhicule de type location */
    public function location(): static
    {
        return $this->state(fn () => [
            'post_type' => Vehicules::POST_TYPE_LOCATION,
        ]);
    }
}
