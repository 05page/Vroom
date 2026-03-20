<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRendezVousRequest;
use App\Models\Notifications;
use App\Models\RendezVous;
use App\Models\TransactionConclue;
use App\Models\Vehicules;
use App\Services\GoogleCalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RendezVousController extends Controller
{
    // ── Client : ses RDV (demandés par lui) ───────────────
    public function mesRdv(): JsonResponse
    {
        try {
            $user = Auth::user();

            $rdvs = RendezVous::with(['vendeur:id,fullname,avatar', 'vehicule.description'])
                ->where('client_id', $user->id)
                ->orderBy('date_heure', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $rdvs], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ── Vendeur : les RDV reçus ────────────────────────────
    public function nosRdv(): JsonResponse
    {
        try {
            $user = Auth::user();

            $rdvs = RendezVous::with(['client:id,fullname,avatar', 'vehicule.description'])
                ->where('vendeur_id', $user->id)
                ->orderBy('date_heure', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $rdvs], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ── Créer un RDV (client → auteur du post véhicule) ───
    public function store(StoreRendezVousRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            $user = Auth::user();

            // Le vendeur est l'auteur du post, pas un champ libre du client
            $vehicule = Vehicules::findOrFail($validated['vehicule_id']);

            if ($vehicule->created_by === $user->id) {
                DB::rollBack(); // transaction ouverte sans données — on annule proprement
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas prendre rendez-vous sur votre propre annonce',
                ], 422);
            }

            $rdv = RendezVous::create([
                'client_id'   => $user->id,
                'vendeur_id'  => $vehicule->created_by,
                'vehicule_id' => $vehicule->id,
                'date_heure'  => $validated['date_heure'],
                'type'        => $validated['type'],
                'statut'      => RendezVous::STATUT_EN_ATTENTE,
                'motif'       => $validated['motif'] ?? null,
                'lieu'        => $validated['lieu'] ?? null,
                'notes'       => $validated['notes'] ?? null,
            ]);

            // Notifier le vendeur
            Notifications::create([
                'user_id' => $vehicule->created_by,
                'type'    => Notifications::TYPE_RDV,
                'title'   => 'Nouvelle demande de rendez-vous',
                'message' => $user->fullname . ' souhaite un rendez-vous le ' . \Carbon\Carbon::parse($validated['date_heure'])->format('d/m/Y à H:i'),
                'data'    => ['rdv_id' => $rdv->id],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Demande de rendez-vous envoyée',
                'data'    => $rdv->load(['client:id,fullname', 'vendeur:id,fullname']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ── Vendeur confirme ───────────────────────────────────
    public function confirmer($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $rdv  = RendezVous::where('id', $id)->where('vendeur_id', $user->id)->firstOrFail();

            DB::beginTransaction();

            $rdv->confirmer();

            // Créer l'événement Google Calendar si le vendeur est connecté
            if (GoogleCalendarService::isUserConnected($user)) {
                try {
                    $rdv->load('client');
                    $start    = $rdv->date_heure->toDateTime();
                    $end      = $rdv->date_heure->copy()->addHour()->toDateTime();
                    $summary  = 'Rendez-vous Vroom — ' . ucfirst($rdv->type);
                    $desc     = $rdv->motif ?? $rdv->notes ?? '';

                    $calendar      = new GoogleCalendarService($user);
                    $googleEventId = $calendar->createEvent($summary, $desc, $start, $end, $rdv->client->email);

                    if ($googleEventId) {
                        $rdv->update(['google_event_id' => $googleEventId]);
                    }
                } catch (\Exception $e) {
                    // L'échec Calendar ne bloque pas la confirmation
                }
            }

            Notifications::create([
                'user_id' => $rdv->client_id,
                'type'    => Notifications::TYPE_RDV,
                'title'   => 'Rendez-vous confirmé',
                'message' => 'Votre rendez-vous du ' . $rdv->date_heure->format('d/m/Y à H:i') . ' a été confirmé.',
                'data'    => ['rdv_id' => $rdv->id],
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Rendez-vous confirmé', 'data' => $rdv], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Rendez-vous introuvable'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    //Proprietaire refuse
    public function refuser(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $rdv  = RendezVous::where('id', $id)->where('vendeur_id', $user->id)->firstOrFail();

            $rdv->refuser();

            Notifications::create([
                'user_id' => $rdv->client_id,
                'type'    => Notifications::TYPE_RDV,
                'title'   => 'Rendez-vous refusé',
                'message' => 'Votre rendez-vous du ' . $rdv->date_heure->format('d/m/Y à H:i') . ' a été refusé.',
                'data'    => ['rdv_id' => $rdv->id],
            ]);

            return response()->json(['success' => true, 'message' => 'Rendez-vous refusé'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Rendez-vous introuvable'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ── Client ou vendeur annule ───────────────────────────
    public function annuler($id): JsonResponse
    {
        try {
            $user = Auth::user();

            $rdv = RendezVous::where('id', $id)
                ->where(function ($q) use ($user) {
                    $q->where('client_id', $user->id)
                      ->orWhere('vendeur_id', $user->id);
                })->firstOrFail();

            if ($rdv->statut === RendezVous::STATUT_TERMINE) {
                return response()->json(['success' => false, 'message' => 'Impossible d\'annuler un RDV terminé'], 422);
            }

            DB::beginTransaction();

            $rdv->annuler();

            // Notifier l'autre partie
            $destinataire = $user->id === $rdv->client_id ? $rdv->vendeur_id : $rdv->client_id;

            Notifications::create([
                'user_id' => $destinataire,
                'type'    => Notifications::TYPE_RDV,
                'title'   => 'Rendez-vous annulé',
                'message' => 'Le rendez-vous du ' . $rdv->date_heure->format('d/m/Y à H:i') . ' a été annulé.',
                'data'    => ['rdv_id' => $rdv->id],
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Rendez-vous annulé'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Rendez-vous introuvable'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ── Vendeur termine ────────────────────────────────────
    public function terminer($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $rdv  = RendezVous::where('id', $id)->where('vendeur_id', $user->id)->with('vehicule')->firstOrFail();

            DB::beginTransaction();

            $rdv->terminer();

            // Génère le code de confirmation et crée la TransactionConclue
            $code = TransactionConclue::genererCode();

            $transaction = TransactionConclue::create([
                'rendez_vous_id'    => $rdv->id,
                'vehicule_id'       => $rdv->vehicule_id,
                'vendeur_id'        => $rdv->vendeur_id,
                'client_id'         => $rdv->client_id,
                'type'              => $rdv->vehicule->post_type, // 'vente' ou 'location'
                'code_confirmation' => $code,
                'expires_at'        => now()->addHours(48),
                'statut'         => TransactionConclue::STATUT_EN_ATTENTE,
            ]);

            // Notifie le vendeur avec le code (pour qu'il puisse le saisir)
            Notifications::create([
                'user_id'    => $rdv->vendeur_id,
                'type'       => Notifications::TYPE_TRANSACTION,
                'title'      => 'RDV terminé — confirmez la transaction',
                'message'    => 'Rendez-vous du ' . $rdv->date_heure->format('d/m/Y') . ' terminé. Code de confirmation : ' . $code . '. Renseignez les détails du deal sur votre dashboard.',
                'data'       => ['transaction_id' => $transaction->id, 'code' => $code],
                'date_envoi' => now(),
            ]);

            // Notifie le client avec le code (pour qu'il puisse confirmer)
            Notifications::create([
                'user_id'    => $rdv->client_id,
                'type'       => Notifications::TYPE_TRANSACTION,
                'title'      => 'Confirmation de transaction requise',
                'message'    => 'Votre rendez-vous du ' . $rdv->date_heure->format('d/m/Y') . ' est terminé. Code de confirmation : ' . $code . '. Confirmez la transaction sur votre dashboard.',
                'data'       => ['transaction_id' => $transaction->id, 'code' => $code],
                'date_envoi' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous terminé. Codes de confirmation envoyés.',
                'data'    => ['rdv' => $rdv, 'transaction_id' => $transaction->id],
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Rendez-vous introuvable'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
