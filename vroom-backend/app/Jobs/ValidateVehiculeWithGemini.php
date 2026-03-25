<?php

namespace App\Jobs;

use App\Models\Notifications;
use App\Models\Vehicules;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ValidateVehiculeWithGemini implements ShouldQueue
{
    use Queueable;

    /**
     * Nombre de tentatives si le job échoue (timeout Gemini, etc.)
     */
    /**
     * Nombre de tentatives si le job échoue (timeout Gemini, etc.)
     */
    public int $tries = 3;

    /**
     * Durée max d'exécution en secondes.
     * Si Gemini ne répond pas dans ce délai, le job est tué — le véhicule reste en_attente.
     */
    public int $timeout = 60;
    /**
     * Laravel sérialise uniquement l'ID du modèle en base.
     * Quand le worker traite le job, il recharge le véhicule depuis la DB.
     */
    public function __construct(public Vehicules $vehicule) {}

    /**
     * Travail exécuté en arrière-plan par le queue worker.
     *
     * Flux :
     *   1. Charger la description du véhicule
     *   2. Construire le prompt et appeler Gemini
     *   3a. Gemini valide   → on ne fait rien (l'admin valide manuellement)
     *   3b. Gemini invalide → statut = rejetee + notification au propriétaire
     *   3c. Gemini en erreur → on laisse le véhicule en_attente, on loggue
     */
    public function handle(): void
    {
        // --- Étape 1 : Charger la description liée au véhicule ---
        $this->vehicule->load('description');
        $desc = $this->vehicule->description;

        // Si la description est absente (cas anormal), on abandonne proprement
        if (!$desc) {
            Log::error("ValidateVehiculeWithGemini : description manquante pour véhicule {$this->vehicule->id}");
            return;
        }

        // --- Étape 2 : Construire le prompt et appeler Gemini ---
        $prompt = "Analysez ce véhicule " . ($this->vehicule->type === 'occasion' ? 'd\'occasion' : 'neuf') . " : " .
            "marque {$desc->marque}, modèle {$desc->modele}, année {$desc->annee}, " .
            "carburant " . ($desc->carburant ?? 'non renseigné') . ", " .
            "kilométrage " . ($desc->kilometrage ?? 'non renseigné') . " km, " .
            "historique d'accidents: " . ($desc->historique_accidents ?? 'non renseigné') . ", " .
            "équipements: " . implode(', ', $desc->equipements ?? []) . ". " .
            "Répondez au format JSON strict : {\"valide\": true/false, \"prix_suggere\": nombre, \"explication\": \"texte\"}. " .
            "Le prix doit être en FCFA (XOF) basé sur le marché ivoirien. " .
            "Si invalide, mettez valide à false et expliquez pourquoi.";

        try {
            // retry() retente 3 fois avec 2 secondes entre chaque tentative
            $geminiResponse = retry(3, function () use ($prompt) {
                return Gemini::generativeModel(model: 'gemini-2.5-flash')
                    ->generateContent($prompt);
            }, 2000);

            // Nettoyer la réponse (Gemini entoure parfois le JSON de ```json ```)
            $responseText = trim($geminiResponse->text());
            $responseText = preg_replace('/```json\n?|\n?```/', '', $responseText);
            $aiResult     = json_decode($responseText, true);

            if (!$aiResult || !isset($aiResult['valide'])) {
                throw new \Exception('Format de réponse invalide de l\'IA');
            }

            // --- Étape 3a : Gemini valide → rien à faire ---
            if ($aiResult['valide']) {
                Log::info("ValidateVehiculeWithGemini : véhicule {$this->vehicule->id} validé par Gemini.");
                return;
            }

            // --- Étape 3b : Gemini invalide → rejeter + notifier le propriétaire ---
            $this->vehicule->update([
                'status_validation'      => Vehicules::STATUS_REJETEE,
                'description_validation' => $aiResult['explication'] ?? 'Données incohérentes détectées par l\'IA.',
            ]);

            // Notifier le propriétaire du véhicule du rejet automatique
            Notifications::create([
                'user_id'    => $this->vehicule->created_by,
                'type'       => Notifications::TYPE_MODERATION,
                'title'      => 'Annonce rejetée automatiquement',
                'message'    => 'Votre annonce ' . $desc->marque . ' ' . $desc->modele .
                    ' a été rejetée : ' . ($aiResult['explication'] ?? 'données incohérentes.'),
                'data'       => ['vehicule_id' => $this->vehicule->id],
                'lu'         => false,
                'date_envoi' => now(),
            ]);
        } catch (\Exception $e) {
            // --- Étape 3c : Erreur Gemini → on loggue, le véhicule reste en_attente ---
            // L'admin pourra le modérer manuellement via le panel
            Log::error("ValidateVehiculeWithGemini : erreur Gemini pour véhicule {$this->vehicule->id} : " . $e->getMessage());
        }
    }
    
    public function failed(\Throwable $e): void
    {
        Log::error("ValidateVehiculeWithGemini : job échoué définitivement pour véhicule {$this->vehicule->id} : " . $e->getMessage());
    }
}
