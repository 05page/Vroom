<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\RendezVous;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AvisController extends Controller
{
    // Laisser un avis après un RDV terminé
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rdv_id'      => 'required|uuid|exists:rendez_vous,id',
            'note'        => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        // Vérifier que le RDV est terminé et appartient au client
        $rdv = RendezVous::where('id', $validated['rdv_id'])
            ->where('client_id', $user->id)
            ->where('statut', RendezVous::STATUT_TERMINE)
            ->firstOrFail();

        // Un seul avis par RDV
        if (Avis::where('client_id', $user->id)->where('vendeur_id', $rdv->vendeur_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Vous avez déjà laissé un avis pour ce vendeur'], 409);
        }

        $avis = Avis::create([
            'client_id'  => $user->id,
            'vendeur_id' => $rdv->vendeur_id,
            'note'       => $validated['note'],
            'commentaire'=> $validated['commentaire'] ?? null,
        ]);

        // Recalculer la note moyenne du vendeur
        $vendeur = User::find($rdv->vendeur_id);
        $vendeur->nb_avis      = Avis::where('vendeur_id', $vendeur->id)->count();
        $vendeur->note_moyenne = Avis::where('vendeur_id', $vendeur->id)->avg('note');
        $vendeur->save();

        return response()->json(['success' => true, 'message' => 'Avis enregistré', 'data' => $avis], 201);
    }

    // Avis d'un vendeur (public)
    public function avisVendeur($vendeurId): JsonResponse
    {
        $avis = Avis::with('client:id,fullname,avatar')
            ->where('vendeur_id', $vendeurId)
            ->orderBy('date_avis', 'desc')
            ->get();

        $moyenne = $avis->avg('note');

        return response()->json([
            'success' => true,
            'data'    => [
                'avis'         => $avis,
                'note_moyenne' => round($moyenne, 1),
                'total'        => $avis->count(),
            ],
        ], 200);
    }
}
