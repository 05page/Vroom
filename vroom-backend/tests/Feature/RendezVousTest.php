<?php

use App\Models\RendezVous;
use App\Models\TransactionConclue;
use App\Models\User;
use App\Models\Vehicules;

// ── Créer un RDV ────────────────────────────────────────────

test('un client peut créer un rdv sur un véhicule', function () {
    $client  = User::factory()->client()->create();
    $vendeur = User::factory()->vendeur()->create();
    $vehicule = Vehicules::factory()->vente()->create(['created_by' => $vendeur->id]);

    $response = $this->actingAs($client)->postJson('/api/rdv', [
        'vehicule_id' => $vehicule->id,
        'date_heure'  => now()->addDays(3)->toDateTimeString(),
        'type'        => RendezVous::TYPE_VISITE,
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('success', true);

    $this->assertDatabaseHas('rendez_vous', [
        'client_id'  => $client->id,
        'vendeur_id' => $vendeur->id,
        'statut'     => RendezVous::STATUT_EN_ATTENTE,
    ]);
});

test('un client ne peut pas créer un rdv sur son propre véhicule', function () {
    $vendeur  = User::factory()->vendeur()->create();
    $vehicule = Vehicules::factory()->vente()->create(['created_by' => $vendeur->id]);

    $response = $this->actingAs($vendeur)->postJson('/api/rdv', [
        'vehicule_id' => $vehicule->id,
        'date_heure'  => now()->addDays(3)->toDateTimeString(),
        'type'        => RendezVous::TYPE_VISITE,
    ]);

    $response->assertStatus(422)
             ->assertJsonPath('success', false);
});

test('la date du rdv doit être dans le futur', function () {
    $client   = User::factory()->client()->create();
    $vendeur  = User::factory()->vendeur()->create();
    $vehicule = Vehicules::factory()->vente()->create(['created_by' => $vendeur->id]);

    $response = $this->actingAs($client)->postJson('/api/rdv', [
        'vehicule_id' => $vehicule->id,
        'date_heure'  => now()->subDay()->toDateTimeString(), // passé
        'type'        => RendezVous::TYPE_VISITE,
    ]);

    $response->assertStatus(422);
});

// ── Confirmer un RDV ────────────────────────────────────────

test('le vendeur peut confirmer un rdv qui lui appartient', function () {
    $vendeur = User::factory()->vendeur()->create();
    $rdv     = RendezVous::factory()->create(['vendeur_id' => $vendeur->id]);

    $response = $this->actingAs($vendeur)->postJson("/api/rdv/{$rdv->id}/confirmer");

    $response->assertStatus(200)
             ->assertJsonPath('success', true);

    $this->assertDatabaseHas('rendez_vous', [
        'id'     => $rdv->id,
        'statut' => RendezVous::STATUT_CONFIRME,
    ]);
});

test('un client ne peut pas confirmer un rdv', function () {
    $client = User::factory()->client()->create();
    $rdv    = RendezVous::factory()->create();

    $response = $this->actingAs($client)->postJson("/api/rdv/{$rdv->id}/confirmer");

    // Route protégée par middleware role:vendeur → 403
    $response->assertStatus(403);
});

test('le vendeur ne peut pas confirmer le rdv d un autre vendeur', function () {
    $autreVendeur = User::factory()->vendeur()->create();
    $rdv          = RendezVous::factory()->create(); // rdv lié à un autre vendeur

    $response = $this->actingAs($autreVendeur)->postJson("/api/rdv/{$rdv->id}/confirmer");

    $response->assertStatus(404);
});

// ── Annuler un RDV ──────────────────────────────────────────

test('le client peut annuler son rdv', function () {
    $client = User::factory()->client()->create();
    $rdv    = RendezVous::factory()->create(['client_id' => $client->id]);

    $response = $this->actingAs($client)->postJson("/api/rdv/{$rdv->id}/annuler");

    $response->assertStatus(200);
    $this->assertDatabaseHas('rendez_vous', [
        'id'     => $rdv->id,
        'statut' => RendezVous::STATUT_ANNULE,
    ]);
});

test('impossible d annuler un rdv terminé', function () {
    $client = User::factory()->client()->create();
    $rdv    = RendezVous::factory()->termine()->create(['client_id' => $client->id]);

    $response = $this->actingAs($client)->postJson("/api/rdv/{$rdv->id}/annuler");

    $response->assertStatus(422);
});

// ── Terminer un RDV ─────────────────────────────────────────

test('le vendeur peut terminer un rdv confirmé et génère une transaction', function () {
    $vendeur  = User::factory()->vendeur()->create();
    $vehicule = Vehicules::factory()->vente()->create(['created_by' => $vendeur->id]);
    $rdv      = RendezVous::factory()->confirme()->create([
        'vendeur_id'  => $vendeur->id,
        'vehicule_id' => $vehicule->id,
    ]);

    $response = $this->actingAs($vendeur)->postJson("/api/rdv/{$rdv->id}/terminer");

    $response->assertStatus(200)
             ->assertJsonPath('success', true);

    $this->assertDatabaseHas('rendez_vous', [
        'id'     => $rdv->id,
        'statut' => RendezVous::STATUT_TERMINE,
    ]);

    // Une TransactionConclue doit avoir été créée
    $this->assertDatabaseHas('transactions_conclues', [
        'rendez_vous_id' => $rdv->id,
        'vendeur_id'     => $vendeur->id,
        'statut'         => TransactionConclue::STATUT_EN_ATTENTE,
    ]);
});

// ── Non authentifié ─────────────────────────────────────────

test('un visiteur non connecté ne peut pas créer un rdv', function () {
    $vehicule = Vehicules::factory()->vente()->create();

    $response = $this->postJson('/api/rdv', [
        'vehicule_id' => $vehicule->id,
        'date_heure'  => now()->addDays(3)->toDateTimeString(),
        'type'        => RendezVous::TYPE_VISITE,
    ]);

    $response->assertStatus(401);
});
