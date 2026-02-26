<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('receiver_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('vehicule_id')->nullable()->constrained('vehicules')->onDelete('cascade');
            $table->foreignUuid('rdv_id')->nullable()->constrained('rendez_vous')->onDelete('cascade');
            $table->enum('type', ['audio', 'text'])->default('text');
            $table->text('content');
            $table->string('audio_path')->nullable();
            $table->integer('duration')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['sender_id', 'receiver_id']);
            $table->index('vehicule_id');
            $table->index('rdv_id');
            $table->index('is_read');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
