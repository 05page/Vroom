<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Str;

/**
 * Service de paiement simulé — aucun vrai appel bancaire.
 * Toutes les transactions sont considérées comme réussies instantanément.
 *
 * Pour passer à Stripe : créer StripePaymentService implements PaymentGatewayInterface
 * et changer le binding dans AppServiceProvider.
 */
class SimulationPaymentService implements PaymentGatewayInterface
{
    public function initiate(float $montant, string $reference, array $metadata = []): array
    {
        // Génère une référence externe simulée (ex: "SIM-xxxxxxxx")
        $transactionRef = 'SIM-' . strtoupper(Str::random(8));

        return [
            'success'         => true,
            'transaction_ref' => $transactionRef,
            'redirect_url'    => null, // Pas de redirection en simulation
            'message'         => 'Paiement simulé accepté',
        ];
    }

    public function confirm(string $transactionRef): array
    {
        // En simulation, toute référence commençant par "SIM-" est valide
        $isValid = str_starts_with($transactionRef, 'SIM-');

        return [
            'success' => $isValid,
            'statut'  => $isValid ? 'réussi' : 'échoué',
            'message' => $isValid ? 'Transaction confirmée (simulation)' : 'Référence invalide',
        ];
    }

    public function getName(): string
    {
        return 'simulation';
    }
}
