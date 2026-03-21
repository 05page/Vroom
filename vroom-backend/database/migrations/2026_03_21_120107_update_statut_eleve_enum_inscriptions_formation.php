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
    public function up(): void
    {
        // PostgreSQL : l'enum Laravel est une varchar avec une CHECK constraint
        // On supprime l'ancienne contrainte et on en recrée une avec les nouvelles valeurs
        DB::statement("ALTER TABLE inscriptions_formation DROP CONSTRAINT IF EXISTS inscriptions_formation_statut_eleve_check");

        DB::statement("ALTER TABLE inscriptions_formation ADD CONSTRAINT inscriptions_formation_statut_eleve_check
            CHECK (statut_eleve IN ('préinscrit', 'paiement_en_cours', 'inscrit', 'en_cours', 'examen_passe', 'terminé', 'abandonné'))");

        DB::statement("ALTER TABLE inscriptions_formation ALTER COLUMN statut_eleve SET DEFAULT 'préinscrit'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE inscriptions_formation DROP CONSTRAINT IF EXISTS inscriptions_formation_statut_eleve_check");

        DB::statement("ALTER TABLE inscriptions_formation ADD CONSTRAINT inscriptions_formation_statut_eleve_check
            CHECK (statut_eleve IN ('inscrit', 'en_cours', 'examen_passe', 'terminé', 'abandonné'))");

        DB::statement("ALTER TABLE inscriptions_formation ALTER COLUMN statut_eleve SET DEFAULT 'inscrit'");
    }
};
