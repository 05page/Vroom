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
        Schema::create('interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); //constrained crée la clé étrangère automatiquement et onDelete cascade supprime les favoris si l'utilisateur est supprimé
            $table->foreignId('post_id')->constrained('vehicules')->onDelete('cascade');
            $table->foreignId('user_signale_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->enum('type', ['alerte', 'favori', 'signalement_user', 'blocage_user']);
            $table->enum('justification_alerte', ['arnaque', 'vehicule_inexistant', 'prix_suspect', 'spam', 'faux_profil', 'harcelement', 'comportement_suspect', 'inapproprié', 'autre'])->nullable();
            $table->text('description_alerte')->nullable();
            $table->enum('status_alerte', ['en_attente', 'examinee', 'rejetee'])->nullable();
            $table->timestamps();
            //empêcher les doublons
            $table->unique(['user_id', 'post_id', 'type']);//évite qu'un utilisateur puisse marquer le même post plusieurs fois comme favori ou alerte
            $table->unique(['user_id', 'user_signale_id', 'type'], 'unique_interaction_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactions');
    }
};
