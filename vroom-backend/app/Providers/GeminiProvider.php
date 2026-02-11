<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\GeminiService;

class GeminiProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        
    }

    /**
     * Bootstrap services.
     */

    //la méthode boot est utilisée pour initialiser des services après leur enregistrement
    public function boot(): void
    {
        //
    }
}
