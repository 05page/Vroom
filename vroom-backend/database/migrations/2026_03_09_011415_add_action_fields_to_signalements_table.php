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
        Schema::table('signalements', function (Blueprint $table) {
            // Valeur choisie par l'admin : avertissement, suspendre, bannir, aucune
            $table->string('action_cible')->nullable()->after('statut');
            // Note optionnelle laissée par l'admin, visible par les parties concernées
            $table->text('note_admin')->nullable()->after('action_cible');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('signalements', function (Blueprint $table) {
            $table->dropColumn(['action_cible', 'note_admin']);
        });
    }
};
