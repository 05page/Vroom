<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\InscriptionFormation;
use App\Models\Notifications;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InscriptionFormationController extends Controller
{
    /**
     * Client s'inscrit à une formation.
     * POST /formations/{id}/inscrire
     */
    public function store(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();

        $formation = Formation::where('statut_validation', Formation::STATUT_VALIDE)
            ->findOrFail($id);

        // Empêche l'auto-école de s'inscrire à sa propre formation
        if ($formation->auto_ecole_id === $user->id) {
            return response()->json(['success' => false, 'message' => 'Action non autorisée'], 403);
        }

        // Empêche une double inscription
        $existante = InscriptionFormation::where('client_id', $user->id)
            ->where('formation_id', $id)
            ->first();

        if ($existante) {
            return response()->json(['success' => false, 'message' => 'Vous êtes déjà inscrit à cette formation'], 422);
        }

        $inscription = InscriptionFormation::create([
            'client_id'    => $user->id,
            'formation_id' => $id,
            'statut_eleve' => InscriptionFormation::STATUT_INSCRIT,
        ]);

        // Notifie l'auto-école
        Notifications::create([
            'user_id'    => $formation->auto_ecole_id,
            'type'       => Notifications::TYPE_FORMATION,
            'title'      => 'Nouvelle inscription',
            'message'    => $user->fullname . ' vient de s\'inscrire à votre formation ' . ($formation->description->titre ?? 'Permis ' . $formation->type_permis),
            'data'       => ['inscription_id' => $inscription->id, 'formation_id' => $id],
            'date_envoi' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inscription confirmée',
            'data'    => $inscription,
        ], 201);
    }

    /**
     * Client consulte ses inscriptions.
     * GET /formations/mes-inscriptions
     */
    public function mesInscriptions(): JsonResponse
    {
        $user = Auth::user();

        $inscriptions = InscriptionFormation::with([
            'formation.description',
            'formation.autoEcole:id,fullname,avatar,taux_reussite',
        ])
            ->where('client_id', $user->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $inscriptions]);
    }

    /**
     * Client annule son inscription (uniquement si statut = inscrit).
     * DELETE /formations/{id}/inscrire
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();

        $inscription = InscriptionFormation::where('client_id', $user->id)
            ->where('formation_id', $id)
            ->firstOrFail();

        if ($inscription->statut_eleve !== InscriptionFormation::STATUT_INSCRIT) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible d\'annuler une formation déjà commencée',
            ], 422);
        }

        // Charge la formation avant suppression pour pouvoir notifier l'auto-école
        $formation = Formation::with('description')->find($id);

        $inscription->delete();

        // Notifie l'auto-école de l'annulation
        if ($formation) {
            Notifications::create([
                'user_id'    => $formation->auto_ecole_id,
                'type'       => Notifications::TYPE_FORMATION,
                'title'      => 'Inscription annulée',
                'message'    => $user->fullname . ' a annulé son inscription à "' .
                                ($formation->description->titre ?? 'Permis ' . $formation->type_permis) . '".',
                'data'       => ['formation_id' => $id],
                'date_envoi' => now(),
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Inscription annulée']);
    }
}
