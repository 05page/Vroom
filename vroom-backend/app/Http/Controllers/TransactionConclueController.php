<?php

namespace App\Http\Controllers;

use App\Models\Notifications;
use App\Models\RendezVous;
use App\Models\TransactionConclue;
use App\Models\Vehicules;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TransactionConclueController extends Controller
{
    /**
     * Vendeur renseigne les infos du deal + confirme avec le code.
     * POST /transactions-conclues/{id}/confirmer-vendeur
     *
     * Body: { code, type, prix_final, date_debut_location?, date_fin_location? }
     */
    public function confirmerVendeur(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();

        $transaction = TransactionConclue::where('id', $id)
            ->where('vendeur_id', $user->id)
            ->where('statut', TransactionConclue::STATUT_EN_ATTENTE)
            ->firstOrFail();

        if (!$transaction->isCodeValide()) {
            $transaction->update(['statut' => TransactionConclue::STATUT_EXPIRE]);
            return response()->json(['success' => false, 'message' => 'Le code a expiré'], 422);
        }

        $validated = $request->validate([
            'code'               => 'required|string|size:6',
            'type'               => ['required', Rule::in(['vente', 'location'])],
            'prix_final'         => 'required|numeric|min:0',
            'date_debut_location'=> 'required_if:type,location|nullable|date',
            'date_fin_location'  => 'required_if:type,location|nullable|date|after:date_debut_location',
        ]);

        if ($validated['code'] !== $transaction->code_confirmation) {
            return response()->json(['success' => false, 'message' => 'Code incorrect'], 422);
        }

        DB::beginTransaction();
        try {
            $transaction->update([
                'type'               => $validated['type'],
                'prix_final'         => $validated['prix_final'],
                'date_debut_location'=> $validated['date_debut_location'] ?? null,
                'date_fin_location'  => $validated['date_fin_location'] ?? null,
                'confirme_par_vendeur' => true,
            ]);

            // Si le client avait déjà confirmé, on finalise
            if ($transaction->confirme_par_client) {
                $this->finaliser($transaction);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Confirmation vendeur enregistrée',
                'data'    => $transaction->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Client confirme avec le code.
     * POST /transactions-conclues/{id}/confirmer-client
     *
     * Body: { code }
     */
    public function confirmerClient(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();

        $transaction = TransactionConclue::where('id', $id)
            ->where('client_id', $user->id)
            ->where('statut', TransactionConclue::STATUT_EN_ATTENTE)
            ->firstOrFail();

        if (!$transaction->isCodeValide()) {
            $transaction->update(['statut' => TransactionConclue::STATUT_EXPIRE]);
            return response()->json(['success' => false, 'message' => 'Le code a expiré'], 422);
        }

        $validated = $request->validate([
            'code' => 'required|string|size:6',
        ]);

        if ($validated['code'] !== $transaction->code_confirmation) {
            return response()->json(['success' => false, 'message' => 'Code incorrect'], 422);
        }

        DB::beginTransaction();
        try {
            $transaction->update(['confirme_par_client' => true]);

            // Si le vendeur avait déjà confirmé (et donc renseigné les infos), on finalise
            if ($transaction->confirme_par_vendeur) {
                $this->finaliser($transaction);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Confirmation client enregistrée',
                'data'    => $transaction->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Client refuse la transaction.
     * POST /transactions-conclues/{id}/refuser
     */
    public function refuserClient(string $id): JsonResponse
    {
        $user = Auth::user();

        $transaction = TransactionConclue::where('id', $id)
            ->where('client_id', $user->id)
            ->where('statut', TransactionConclue::STATUT_EN_ATTENTE)
            ->firstOrFail();

        $transaction->update(['statut' => TransactionConclue::STATUT_REFUSE]);

        Notifications::create([
            'user_id'    => $transaction->vendeur_id,
            'type'       => Notifications::TYPE_TRANSACTION,
            'title'      => 'Transaction refusée',
            'message'    => $transaction->client->fullname . ' a refusé de confirmer la transaction.',
            'data'       => ['transaction_id' => $transaction->id, 'rdv_id' => $transaction->rendez_vous_id],
            'date_envoi' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Transaction refusée']);
    }

    /**
     * Retourne les transactions en attente du client connecté.
     * GET /transactions-conclues/mes-demandes
     */
    public function mesDemandes(): JsonResponse
    {
        $user = Auth::user();

        $transactions = TransactionConclue::with([
            'vendeur:id,fullname,avatar',
            'vehicule.description',
            'vehicule.photos',
        ])
            ->where('client_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $transactions]);
    }

    /**
     * Retourne les transactions du vendeur connecté.
     * GET /transactions-conclues/mes-transactions
     */
    public function mesTransactions(): JsonResponse
    {
        $user = Auth::user();

        $transactions = TransactionConclue::with([
            'client:id,fullname,avatar',
            'vehicule.description',
            'vehicule.photos',
        ])
            ->where('vendeur_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $transactions]);
    }

    /**
     * Finalise la transaction une fois les deux confirmations reçues.
     * Méthode privée appelée après chaque confirmation.
     */
    private function finaliser(TransactionConclue $transaction): void
    {
        $transaction->update(['statut' => TransactionConclue::STATUT_CONFIRME]);

        // Met à jour le statut du véhicule
        $nouveauStatut = $transaction->type === 'vente'
            ? Vehicules::STATUS_VENDU
            : Vehicules::STATUS_LOUE;

        Vehicules::where('id', $transaction->vehicule_id)
            ->update(['statut' => $nouveauStatut]);

        // Notifie vendeur et client
        $messageVendeur = $transaction->type === 'vente'
            ? 'Vente confirmée ! Le véhicule est marqué comme vendu.'
            : 'Location confirmée ! Le véhicule est marqué comme loué.';

        $messageClient = $transaction->type === 'vente'
            ? 'Votre achat a été confirmé avec succès.'
            : 'Votre location a été confirmée avec succès.';

        foreach ([
            [$transaction->vendeur_id, $messageVendeur],
            [$transaction->client_id,  $messageClient],
        ] as [$userId, $message]) {
            Notifications::create([
                'user_id'    => $userId,
                'type'       => Notifications::TYPE_TRANSACTION,
                'title'      => 'Transaction confirmée ✓',
                'message'    => $message,
                'data'       => ['transaction_id' => $transaction->id],
                'date_envoi' => now(),
            ]);
        }
    }
}
