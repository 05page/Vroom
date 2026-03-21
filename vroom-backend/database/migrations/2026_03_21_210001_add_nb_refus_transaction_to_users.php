<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Nombre de fois où ce vendeur a refusé ou laissé expirer une transaction.
            // Visible sur son profil public pour alerter les acheteurs potentiels.
            $table->unsignedInteger('nb_refus_transaction')->default(0)->after('taux_reussite');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('nb_refus_transaction');
        });
    }
};
