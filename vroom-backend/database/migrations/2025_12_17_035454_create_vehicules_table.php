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
        Schema::create('vehicules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade')->after('id');
            $table->enum('post_type', ['vente', 'location']);
            $table->enum('type', ['neuf', 'occasion']);
            $table->enum('statut', ['disponible', 'vendu', 'loué']);
            $table->decimal('prix', 10, 2);
            $table->decimal('prix_suggere', 10, 2)->nullable();
            $table->boolean('negociable')->default(false);
            $table->date('date_disponibilite')->nullable();
            $table->enum('status_validation', ['en_attente', 'validee', 'rejetee', 'suspendu', 'restauree', 'retrait'])->default('en_attente');
            $table->text('description_validation')->nullable();

            $table->foreignId('withdraw_by')->nullable()->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('views_count')->default(0);
            $table->foreignId('view_by')->nullable()->constrained('users')->onDelete('cascade');
            $table->softDeletes();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicules');
    }
};
