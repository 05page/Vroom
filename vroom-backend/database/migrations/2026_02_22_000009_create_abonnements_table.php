<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('abonnements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('plan_id')->constrained('plans_abonnement')->onDelete('restrict');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->enum('statut', ['actif', 'expiré', 'suspendu', 'résilié']);
            $table->enum('periodicite', ['mensuel', 'annuel']);
            $table->boolean('renouvellement_auto')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonnements');
    }
};
