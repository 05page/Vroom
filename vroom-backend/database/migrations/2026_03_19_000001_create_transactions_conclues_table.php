<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions_conclues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('rendez_vous_id')->constrained('rendez_vous')->onDelete('restrict');
            $table->foreignUuid('vehicule_id')->constrained('vehicules')->onDelete('restrict');
            $table->foreignUuid('vendeur_id')->constrained('users')->onDelete('restrict');
            $table->foreignUuid('client_id')->constrained('users')->onDelete('restrict');

            $table->enum('type', ['vente', 'location']);
            $table->decimal('prix_final', 12, 2)->nullable(); // renseigné par le vendeur avant confirmation
            $table->date('date_debut_location')->nullable();  // location uniquement
            $table->date('date_fin_location')->nullable();    // location uniquement

            $table->string('code_confirmation', 6);
            $table->timestamp('expires_at');                  // +48h après création

            $table->boolean('confirme_par_vendeur')->default(false);
            $table->boolean('confirme_par_client')->default(false);

            $table->enum('statut', ['en_attente', 'confirmé', 'expiré', 'refusé'])->default('en_attente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions_conclues');
    }
};
