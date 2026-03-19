<?php

namespace App\Contracts;

/**
 * Contrat commun pour tous les services de paiement.
 * Pour brancher Stripe, CinetPay, etc. : créer une classe qui implémente cette interface
 * et la binder dans AppServiceProvider.
 */
interface PaymentGatewayInterface
{
    /**
     * Initie une transaction de paiement.
     *
     * @param  float  $montant    Montant en FCFA (ou devise native du gateway)
     * @param  string $reference  Référence interne unique (ex: "ABN-{uuid}")
     * @param  array  $metadata   Données supplémentaires (user_id, plan_id, etc.)
     * @return array{
     *   success: bool,
     *   transaction_ref: string,
     *   redirect_url: string|null,
     *   message: string
     * }
     */
    public function initiate(float $montant, string $reference, array $metadata = []): array;

    /**
     * Vérifie et confirme le statut d'une transaction existante.
     *
     * @param  string $transactionRef  Référence externe retournée par initiate()
     * @return array{
     *   success: bool,
     *   statut: string,
     *   message: string
     * }
     */
    public function confirm(string $transactionRef): array;

    /**
     * Retourne le nom identifiant du gateway (ex: "simulation", "stripe", "cinetpay").
     */
    public function getName(): string;
}
