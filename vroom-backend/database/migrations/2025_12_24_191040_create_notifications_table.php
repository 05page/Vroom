<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['rdv', 'formation', 'alerte_vehicule', 'abonnement', 'moderation']);
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->boolean('lu')->default(false);
            $table->timestamp('lu_at')->nullable();
            $table->timestamp('date_envoi')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'lu']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
