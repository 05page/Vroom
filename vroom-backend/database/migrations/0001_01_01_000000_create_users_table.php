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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('fullname');
            $table->enum('role', ['client', 'vendeur', 'partenaire', 'admin'])->default('client');
            $table->enum('partenaire_type', ['auto_ecole', 'concessionnaire', 'entretien'])->nullable();
            $table->string('email')->unique();
                        // Colonne demandée par l'erreur : google_id
            $table->string('google_id')->nullable()->unique();

            // Ajoutez aussi les autres fournisseurs pour le futur
            $table->string('facebook_id')->nullable()->unique();
            $table->string('avatar')->nullable(); // Pour l'image de profil
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('account_status',['actif', 'suspendu', 'banni'])->default('actif');
            $table->boolean('active')->default(false);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
