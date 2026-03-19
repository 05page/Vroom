<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vendeur_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('client_id')->constrained('users')->onDelete('cascade');
            $table->text('contenu');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_notes');
    }
};
