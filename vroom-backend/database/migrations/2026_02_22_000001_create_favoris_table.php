<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favoris', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('vehicule_id')->constrained('vehicules')->onDelete('cascade');
            $table->timestamp('date_ajout')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'vehicule_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favoris');
    }
};
