<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans_abonnement', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nom', 100)->unique();
            $table->text('description')->nullable();
            $table->enum('cible', ['vendeur', 'concessionnaire', 'auto_ecole']);
            $table->decimal('prix_mensuel', 10, 2);
            $table->decimal('prix_annuel', 10, 2);
            $table->integer('nb_postes_max')->default(1);
            $table->integer('nb_annonces_max');
            $table->integer('nb_photos_max');
            $table->boolean('stats_avancees')->default(false);
            $table->boolean('badge_premium')->default(false);
            $table->boolean('boost_annonces')->default(false);
            $table->boolean('acces_leads')->default(false);
            $table->boolean('support_prioritaire')->default(false);
            $table->boolean('actif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans_abonnement');
    }
};
