<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('signalements', function (Blueprint $table) {
            // Rend client_id nullable pour permettre les signalements automatiques
            // générés par le système (ex: transaction non confirmée par le vendeur).
            $table->foreignUuid('client_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('signalements', function (Blueprint $table) {
            $table->foreignUuid('client_id')->nullable(false)->change();
        });
    }
};
