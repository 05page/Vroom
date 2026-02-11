<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('google_event_id')->nullable()->after('heure_rdv');
            $table->enum('type_finalisation', ['vente', 'location'])->nullable()->after('statut');
            $table->boolean('confirme_par_client')->default(false)->after('type_finalisation');
            $table->boolean('confirme_par_vendeur')->default(false)->after('confirme_par_client');
            $table->date('date_debut_location')->nullable()->after('confirme_par_vendeur');
            $table->date('date_retour_prevue')->nullable()->after('date_debut_location');
            $table->date('date_retour_effective')->nullable()->after('date_retour_prevue');
            $table->decimal('prix_location_jour', 10, 2)->nullable()->after('date_retour_effective');
            $table->decimal('caution', 10, 2)->nullable()->after('prix_location_jour');
            $table->decimal('prix_final', 10, 2)->nullable()->after('caution');
            $table->integer('rating_client')->nullable()->after('note_client');
            $table->integer('rating_proprietaire')->nullable()->after('note_proprietaire');
            $table->timestamp('effectue_at')->nullable()->after('confirme_at');
            $table->timestamp('retourne_at')->nullable()->after('effectue_at');
        });

        // Modifier l'enum statut
        //DB::statement("ALTER TABLE transactions DROP CONSTRAINT transactions_statut_check");
        //DB::statement("ALTER TABLE transactions ADD CONSTRAINT transactions_statut_check CHECK (statut IN ('en_attente', 'confirme', 'en_cours', 'effectue', 'retourne', 'annule'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
