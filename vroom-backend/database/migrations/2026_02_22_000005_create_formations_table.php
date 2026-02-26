<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('auto_ecole_id')->constrained('users')->onDelete('cascade');
            $table->enum('type_permis', ['A', 'A2', 'B', 'B1', 'C', 'D']);
            $table->decimal('prix', 10, 2);
            $table->integer('duree_heures');
            $table->enum('statut_validation', ['en_attente', 'validé', 'rejeté'])->default('en_attente');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
