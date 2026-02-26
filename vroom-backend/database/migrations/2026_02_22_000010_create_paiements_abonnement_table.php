<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements_abonnement', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('abonnement_id')->constrained('abonnements')->onDelete('restrict');
            $table->dateTime('date_paiement');
            $table->decimal('montant', 10, 2);
            $table->enum('methode', ['carte', 'virement', 'mobile_money']);
            $table->enum('statut', ['réussi', 'échoué', 'remboursé', 'en_attente']);
            $table->string('reference_externe', 255)->unique();
            $table->timestamps();
            // Pas de soft delete — trace comptable permanente
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements_abonnement');
    }
};
