<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicules_description', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicule_id')->constrained('vehicules')->onDelete('cascade');
            $table->string('marque', 500);
            $table->string('modele', 500);
            $table->year('annee')->nullable();
            $table->string('carburant', 100)->nullable();
            $table->string('transmission', 100)->nullable();
            $table->integer('kilometrage')->nullable();
            $table->string('carrosserie', 255)->nullable();
            $table->string('couleur', 100)->nullable();
            $table->integer('nombre_portes')->nullable();
            $table->integer('nombre_places')->nullable();

            $table->enum('visite_technique', ['à_jour', 'expirée', 'non_concerné'])->nullable();
            $table->date('date_visite_technique')->nullable();
            $table->enum('carte_grise', ['à_jour', 'expirée', 'non_concerné'])->nullable();
            $table->date('date_carte_grise')->nullable();
            $table->enum('assurance', ['à_jour', 'expirée', 'non_concerné'])->nullable();
            $table->enum('historique_accidents', ['aucun', 'quelques_accidents', 'nombreux_accidents'])->nullable();
            $table->json('equipements')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicules_description');
    }
};
