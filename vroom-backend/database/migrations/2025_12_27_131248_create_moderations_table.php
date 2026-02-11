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
        Schema::create('moderations', function (Blueprint $table) {
            $table->id();

        //Entité modérée (véhicule, user, agence, etc.)
        $table->string('moderatable_type');
        $table->unsignedBigInteger('moderable_id');

        //Admin ayant pris la décision
        $table->foreignId('admin_id')
              ->constrained('users')
              ->onDelete('cascade');

        $table->enum('action', [
            'validation',
            'retrait',
            'restauration',
            'suspension',
            'bannissement',
            'rejet'
        ])->nullable();

        //Justification principale
        $table->enum('motif', [
            'arnaque',
            'contenu_illicite',
            'prix_suspect',
            'usurpation_identite',
            'signalements_multiples',
            'non_conformite',
            'autre'
        ])->nullable();

        //Détails libres (obligatoire si motif = autre)
        $table->text('description')->nullable();

        //Statut du traitement
        $table->enum('status', [
            'en_cours',
            'decision_finale',
            'levee'
        ])->default('en_cours');

        //Gestion du délai (ex : 30 jours)
        $table->timestamp('decision_at')->nullable();
        $table->timestamp('expire_at')->nullable();

        //Audit
        $table->timestamps();

        //Index pour performance & back-office
        $table->index(['moderatable_type', 'moderable_id']);
        $table->index(['admin_id']);
        $table->index(['action']);
        $table->index(['status']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('moderations');
    }
};
