<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('vendeur_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('vehicule_id')->nullable()->constrained('vehicules')->onDelete('set null');
            $table->dateTime('date_heure');
            $table->enum('type', ['visite', 'essai_routier', 'premiere_rencontre']);
            $table->enum('statut', ['en_attente', 'confirmé', 'refusé', 'annulé', 'terminé'])->default('en_attente');
            $table->text('motif')->nullable();
            $table->string('lieu', 255)->nullable();
            $table->text('notes')->nullable();
            $table->string('google_event_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
