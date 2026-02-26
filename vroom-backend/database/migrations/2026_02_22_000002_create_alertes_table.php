<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->string('marque_cible', 100)->nullable();
            $table->string('modele_cible', 100)->nullable();
            $table->decimal('prix_max', 12, 2)->nullable();
            $table->enum('carburant', ['essence', 'diesel', 'electrique', 'hybride', 'GPL'])->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes');
    }
};
