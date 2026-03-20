<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFormationRequest;
use App\Http\Requests\UpdateFormationRequest;
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
     * Liste tous les inscrits de toutes les formations de cette auto-ecole.
     * GET /formations/mes-inscrits
     *
     * Inclut la formation (type_permis + titre) et le client pour chaque inscription.
     * Permet a l'auto-ecole de voir d'un coup l'ensemble de ses eleves
     * et quel type de permis chacun a choisi.
     */
    public function mesInscrits(): JsonResponse
    {
        $userId = Auth::id();

        $inscrits = InscriptionFormation::whereHas('formation', function ($q) use ($userId) {
                $q->where('auto_ecole_id', $userId);
            })
            ->with([
                'client:id,fullname,email,avatar,telephone',
                'formation:id,type_permis,auto_ecole_id',
                'formation.description:formation_id,titre',
            ])
            ->orderByDesc('date_inscription')
            ->get();

        return response()->json(['success' => true, 'data' => $inscrits]);
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
    public function store(StoreFormationRequest $request): JsonResponse
    {
        $user      = Auth::user();
        $validated = $request->validated();

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
    public function update(UpdateFormationRequest $request, string $id): JsonResponse
    {
        $user = Auth::user();

        $formation = Formation::where('id', $id)
            ->where('auto_ecole_id', $user->id)
            ->firstOrFail();

        $validated = $request->validated();

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
            InscriptionFormation::STATUT_EXAMEN_PASSE => 'Votre examen est enregistré.' . (($validated['date_examen'] ?? null) ? ' Date : ' . $validated['date_examen'] : ''),
            InscriptionFormation::STATUT_TERMINE      => ($validated['reussite'] ?? false)
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
