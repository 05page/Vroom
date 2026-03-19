<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind du gateway de paiement — remplacer SimulationPaymentService
        // par StripePaymentService ou CinetPayPaymentService pour le vrai paiement
        $this->app->bind(
            \App\Contracts\PaymentGatewayInterface::class,
            \App\Services\SimulationPaymentService::class,
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
