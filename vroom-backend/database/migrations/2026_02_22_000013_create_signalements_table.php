<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signalements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignUuid('cible_user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignUuid('cible_vehicule_id')->nullable()->constrained('vehicules')->onDelete('cascade');
            $table->string('motif', 255);
            $table->text('description')->nullable();
            $table->enum('statut', ['en_attente', 'traité', 'rejeté'])->default('en_attente');
            $table->timestamp('date_signalement')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signalements');
    }
};
