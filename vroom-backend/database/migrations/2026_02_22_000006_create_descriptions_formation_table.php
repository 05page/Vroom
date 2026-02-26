<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('descriptions_formation', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('formation_id')->unique()->constrained('formations')->onDelete('cascade');
            $table->string('titre', 255);
            $table->text('texte');
            $table->string('langue', 10)->default('fr');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('descriptions_formation');
    }
};
