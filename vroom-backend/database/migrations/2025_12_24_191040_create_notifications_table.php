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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recever_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); //type de notification(exemple: achat, message, alerte)
            $table->string('title'); //titre de la notification
            $table->text('message'); //contenu de la notification
            $table->json('data')->nullable(); //données supplémentaires liées à la notification
            $table->boolean('is_read')->default(false); //statut de lecture
            $table->timestamp('read_at')->nullable(); //date de lecture
            $table->timestamps();

            
            $table->index(['recever_id', 'is_read']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
