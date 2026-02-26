<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicule_vues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicule_id')->constrained('vehicules')->onDelete('cascade');
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('ip_address', 45)->nullable(); // pour les visiteurs non connectés
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicule_vues');
    }
};
