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
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('participant_1_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->foreignUuid('participant_2_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->foreignUuid('vehicule_id')
                  ->constrained('vehicules')
                  ->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            // Un seul fil de conversation par paire d'utilisateurs par véhicule
            $table->unique(
                ['participant_1_id', 'participant_2_id', 'vehicule_id'],
                'conversations_participants_vehicule_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
