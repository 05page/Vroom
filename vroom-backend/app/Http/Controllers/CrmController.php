<?php

namespace App\Http\Controllers;

use App\Models\CrmNote;
use App\Models\RendezVous;
use App\Models\TransactionConclue;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CrmController extends Controller
{
    /**
     * Liste unique des clients ayant eu au moins un RDV avec ce vendeur.
     * GET /crm/clients
     *
     * Pour chaque client : infos de base + stats rapides (nb rdv, nb transactions, dernière interaction)
     */
    public function clients(): JsonResponse
    {
        $vendeur = Auth::user();

        // Récupère tous les client_id distincts via les RDV
        $clientIds = RendezVous::where('vendeur_id', $vendeur->id)
            ->distinct()
            ->pluck('client_id');

        $clients = User::whereIn('id', $clientIds)
            ->select('id', 'fullname', 'email', 'avatar', 'telephone', 'adresse', 'created_at')
            ->get()
            ->map(function (User $client) use ($vendeur) {
                $rdvs = RendezVous::where('vendeur_id', $vendeur->id)
                    ->where('client_id', $client->id)
                    ->orderBy('date_heure', 'desc')
                    ->get();

                $transactions = TransactionConclue::where('vendeur_id', $vendeur->id)
                    ->where('client_id', $client->id)
                    ->where('statut', TransactionConclue::STATUT_CONFIRME)
                    ->get();

                $dernierRdv = $rdvs->first();

                return [
                    'id'                  => $client->id,
                    'fullname'            => $client->fullname,
                    'email'               => $client->email,
                    'avatar'              => $client->avatar,
                    'telephone'           => $client->telephone,
                    'adresse'             => $client->adresse,
                    'nb_rdv'              => $rdvs->count(),
                    'nb_transactions'     => $transactions->count(),
                    'chiffre_affaires'    => $transactions->sum('prix_final'),
                    'derniere_interaction'=> $dernierRdv?->date_heure,
                    'statut_dernier_rdv'  => $dernierRdv?->statut,
                ];
            })
            ->sortByDesc('derniere_interaction')
            ->values();

        return response()->json(['success' => true, 'data' => $clients]);
    }

    /**
     * Fiche complète d'un client.
     * GET /crm/clients/{clientId}
     *
     * Retourne : infos client + RDV + transactions + notes CRM
     */
    public function clientDetail(string $clientId): JsonResponse
    {
        $vendeur = Auth::user();

        // Vérifie que ce client a au moins un RDV avec ce vendeur
        $hasRelation = RendezVous::where('vendeur_id', $vendeur->id)
            ->where('client_id', $clientId)
            ->exists();

        if (!$hasRelation) {
            return response()->json(['success' => false, 'message' => 'Client introuvable'], 404);
        }

        $client = User::select('id', 'fullname', 'email', 'avatar', 'telephone', 'adresse', 'created_at')
            ->findOrFail($clientId);

        $rdvs = RendezVous::with('vehicule.description')
            ->where('vendeur_id', $vendeur->id)
            ->where('client_id', $clientId)
            ->orderBy('date_heure', 'desc')
            ->get();

        $transactions = TransactionConclue::with('vehicule.description')
            ->where('vendeur_id', $vendeur->id)
            ->where('client_id', $clientId)
            ->orderBy('created_at', 'desc')
            ->get();

        $notes = CrmNote::where('vendeur_id', $vendeur->id)
            ->where('client_id', $clientId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'client'       => $client,
                'rdvs'         => $rdvs,
                'transactions' => $transactions,
                'notes'        => $notes,
                'stats'        => [
                    'nb_rdv'           => $rdvs->count(),
                    'nb_confirmes'     => $rdvs->where('statut', 'confirmé')->count(),
                    'nb_termines'      => $rdvs->where('statut', 'terminé')->count(),
                    'nb_transactions'  => $transactions->where('statut', 'confirmé')->count(),
                    'chiffre_affaires' => $transactions->where('statut', 'confirmé')->sum('prix_final'),
                ],
            ],
        ]);
    }

    /**
     * Ajoute une note privée sur un client.
     * POST /crm/clients/{clientId}/notes
     */
    public function storeNote(Request $request, string $clientId): JsonResponse
    {
        $vendeur = Auth::user();

        $validated = $request->validate([
            'contenu' => 'required|string|max:2000',
        ]);

        $note = CrmNote::create([
            'vendeur_id' => $vendeur->id,
            'client_id'  => $clientId,
            'contenu'    => $validated['contenu'],
        ]);

        return response()->json(['success' => true, 'data' => $note], 201);
    }

    /**
     * Modifie une note.
     * PUT /crm/notes/{noteId}
     */
    public function updateNote(Request $request, string $noteId): JsonResponse
    {
        $vendeur = Auth::user();

        $note = CrmNote::where('id', $noteId)
            ->where('vendeur_id', $vendeur->id)
            ->firstOrFail();

        $validated = $request->validate(['contenu' => 'required|string|max:2000']);

        $note->update($validated);

        return response()->json(['success' => true, 'data' => $note]);
    }

    /**
     * Supprime une note.
     * DELETE /crm/notes/{noteId}
     */
    public function destroyNote(string $noteId): JsonResponse
    {
        $vendeur = Auth::user();

        CrmNote::where('id', $noteId)
            ->where('vendeur_id', $vendeur->id)
            ->firstOrFail()
            ->delete();

        return response()->json(['success' => true, 'message' => 'Note supprimée']);
    }
}
