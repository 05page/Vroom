<?php

namespace App\Http\Controllers;

use App\Models\DescriptionFormation;
use App\Models\Formation;
use App\Models\InscriptionFormation;
use App\Models\Notifications;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class FormationController extends Controller
{
    /**
     * Catalogue public des formations validées.
     * GET /formations
     */
    public function index(): JsonResponse
    {
        $formations = Formation::with(['autoEcole:id,fullname,avatar,note_moyenne,nb_avis,taux_reussite', 'description'])
            ->where('statut_validation', Formation::STATUT_VALIDE)
            ->withCount('inscriptions')
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $formations]);
    }

    /**
     * Détail d'une formation (public).
     * GET /formations/{id}
     */
    public function show(string $id): JsonResponse
    {
        $formation = Formation::with([
            'autoEcole:id,fullname,avatar,note_moyenne,nb_avis,taux_reussite,adresse_showroom',
            'description',
        ])
            ->where('statut_validation', Formation::STATUT_VALIDE)
            ->withCount('inscriptions')
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $formation]);
    }

    /**
     * Formations de l'auto-école connectée.
     * GET /formations/mes-formations
     */
    public function mesFormations(): JsonResponse
    {
        $user = Auth::user();

        $formations = Formation::with(['description'])
            ->where('auto_ecole_id', $user->id)
            ->withCount('inscriptions')
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $formations]);
    }

    /**
     * Liste des inscrits d'une formation (auto-école uniquement).
     * GET /formations/{id}/inscrits
     */
    public function inscrits(string $id): JsonResponse
    {
        $user = Auth::user();

        $formation = Formation::where('id', $id)
            ->where('auto_ecole_id', $user->id)
            ->firstOrFail();

        $inscrits = InscriptionFormation::with('client:id,fullname,email,avatar,telephone')
            ->where('formation_id', $formation->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $inscrits]);
    }

    /**
     * Crée une formation avec sa description.
     * POST /formations
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'type_permis'  => ['required', Rule::in(['A', 'A2', 'B', 'B1', 'C', 'D'])],
            'prix'         => 'required|numeric|min:0',
            'duree_heures' => 'required|integer|min:1',
            'titre'        => 'required|string|max:255',
            'texte'        => 'required|string',
            'langue'       => 'nullable|string|max:10',
        ]);

        DB::beginTransaction();
        try {
            $formation = Formation::create([
                'auto_ecole_id'      => $user->id,
                'type_permis'        => $validated['type_permis'],
                'prix'               => $validated['prix'],
                'duree_heures'       => $validated['duree_heures'],
                'statut_validation'  => Formation::STATUT_EN_ATTENTE,
            ]);

            DescriptionFormation::create([
                'formation_id' => $formation->id,
                'titre'        => $validated['titre'],
                'texte'        => $validated['texte'],
                'langue'       => $validated['langue'] ?? 'fr',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Formation soumise — en attente de validation admin',
                'data'    => $formation->load('description'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Modifie une formation.
     * PUT /formations/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();

        $formation = Formation::where('id', $id)
            ->where('auto_ecole_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'type_permis'  => ['sometimes', Rule::in(['A', 'A2', 'B', 'B1', 'C', 'D'])],
            'prix'         => 'sometimes|numeric|min:0',
            'duree_heures' => 'sometimes|integer|min:1',
            'titre'        => 'sometimes|string|max:255',
            'texte'        => 'sometimes|string',
        ]);

        DB::beginTransaction();
        try {
            $formation->update(array_intersect_key($validated, array_flip(['type_permis', 'prix', 'duree_heures'])));

            if (isset($validated['titre']) || isset($validated['texte'])) {
                $formation->description()->updateOrCreate(
                    ['formation_id' => $formation->id],
                    array_intersect_key($validated, array_flip(['titre', 'texte']))
                );
            }

            DB::commit();
            return response()->json(['success' => true, 'data' => $formation->load('description')]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprime une formation.
     * DELETE /formations/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();

        Formation::where('id', $id)
            ->where('auto_ecole_id', $user->id)
            ->firstOrFail()
            ->delete();

        return response()->json(['success' => true, 'message' => 'Formation supprimée']);
    }

    /**
     * Auto-école met à jour le statut d'un élève inscrit.
     * PUT /formations/{formationId}/inscrits/{inscriptionId}
     *
     * Body: { statut_eleve, date_examen?, reussite? }
     */
    public function updateInscrit(Request $request, string $formationId, string $inscriptionId): JsonResponse
    {
        $user = Auth::user();

        // Vérifie que la formation appartient à cette auto-école
        Formation::where('id', $formationId)
            ->where('auto_ecole_id', $user->id)
            ->firstOrFail();

        $inscription = InscriptionFormation::where('id', $inscriptionId)
            ->where('formation_id', $formationId)
            ->firstOrFail();

        $validated = $request->validate([
            'statut_eleve' => ['required', Rule::in([
                InscriptionFormation::STATUT_INSCRIT,
                InscriptionFormation::STATUT_EN_COURS,
                InscriptionFormation::STATUT_EXAMEN_PASSE,
                InscriptionFormation::STATUT_TERMINE,
                InscriptionFormation::STATUT_ABANDONNE,
            ])],
            'date_examen' => 'nullable|date',
            'reussite'    => 'nullable|boolean',
        ]);

        $inscription->update($validated);

        // Notifie le client de l'avancement
        $messages = [
            InscriptionFormation::STATUT_EN_COURS     => 'Votre formation a démarré. Bonne chance !',
            InscriptionFormation::STATUT_EXAMEN_PASSE => 'Votre examen est enregistré.' . ($validated['date_examen'] ? ' Date : ' . $validated['date_examen'] : ''),
            InscriptionFormation::STATUT_TERMINE      => $validated['reussite']
                ? 'Félicitations ! Vous avez réussi votre formation.'
                : 'Votre formation est terminée.',
        ];

        if (isset($messages[$validated['statut_eleve']])) {
            Notifications::create([
                'user_id'    => $inscription->client_id,
                'type'       => Notifications::TYPE_FORMATION,
                'title'      => 'Mise à jour de votre formation',
                'message'    => $messages[$validated['statut_eleve']],
                'data'       => ['inscription_id' => $inscription->id, 'formation_id' => $formationId],
                'date_envoi' => now(),
            ]);
        }

        return response()->json(['success' => true, 'data' => $inscription->load('client:id,fullname,avatar')]);
    }
}
