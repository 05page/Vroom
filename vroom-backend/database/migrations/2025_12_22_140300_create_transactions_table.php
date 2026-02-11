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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('proprietaire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('vehicule_id')->constrained('vehicules')->onDelete('cascade');
            $table->string('numero_cni')->nullable();
            $table->string('numero_permis')->nullable();
            $table->date('date_rdv');
            $table->time('heure_rdv');
            $table->enum('statut', [
                'en_attente',
                'confirme',
                'effectue',
                'annule'
            ])->default('en_attente');
            $table->text('note_client')->nullable();
            $table->text('note_proprietaire')->nullable();
            $table->timestamp('confirme_at')->nullable();
            $table->timestamp('annule_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
