<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicules;
use Illuminate\Auth\Access\Response;

class VehiculePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Vehicules $vehicules): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Vehicules $vehicules): Response
    {
        return $user->id === $vehicules->created_by 
            ? Response::allow()
            : Response::deny('Vous n\'êtes pas autorisé à modifier ce véhicule.');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Vehicules $vehicules): Response
    {
        return $user->id === $vehicules->created_by
            ? Response::allow()
            : Response::deny('Vous n\'êtes pas autorisé à supprimer ce véhicule.');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Vehicules $vehicules): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Vehicules $vehicules): bool
    {
        return false;
    }
}
