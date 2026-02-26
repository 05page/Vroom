<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('vendeur_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignUuid('auto_ecole_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->tinyInteger('note'); // 1-5
            $table->text('commentaire')->nullable();
            $table->timestamp('date_avis')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};
