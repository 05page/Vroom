<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicules_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicule_id')->constrained('vehicules')->onDelete('cascade');
            $table->string('path');
            $table->boolean('is_primary')->default(false);
            $table->integer('position')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicules_photos');
    }
};
