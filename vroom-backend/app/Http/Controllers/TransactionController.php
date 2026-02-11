 <?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Transactions;
use App\Models\Vehicules;
use App\Models\Notifications;
use App\Models\User;
use Carbon\Carbon;
use App\Services\GoogleCalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    /**
     * Le GoogleCalendarService n'est plus injecté dans le constructeur 
     * pour éviter des erreurs d'initialisation inutiles pour les utilisateurs non connectés.
     */
    public function __construct()
    {
    }
    private function calculerTauxConversion($userId): float
    {
        $rdvTotal = Transactions::where('proprietaire_id', $userId)->count();
        $rdvEffectues = Transactions::where('proprietaire_id', $userId)
            ->where('statut', Transactions::STATUT_EFFECTUE)
            ->count();

        return $rdvTotal > 0 ? round(($rdvEffectues / $rdvTotal) * 100, 2) : 0;
    }
    //
    public function mesRdv(): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            $transactions = Transactions::with('vehicule', 'proprietaire')
                ->where('user_id', $user->id)
                ->get();

            if ($transactions->count() == 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Aucun achat trouvé pour cet utilisateur',
                    'data' => [],
                ], 200);
            }

            return response()->json([
                'success' => true,
                'data' => $transactions,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des achats',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function nosRdv(): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => "Utilisateur non authentifié"
                ], 401);
            }

            if ($user->role !== User::VENDEUR && $user->role !== User::PARTENAIRE) {
                return response()->json([
                    'success' => false,
                    'message' => "Un client n'a pas l'autorisation d'accéder à cet espace"
                ], 403);
            }

            $nosRdv = Transactions::where('proprietaire_id', $user->id)
                ->get();

            $stats = [
                'total_vehicules' => Vehicules::where('created_by', $user->id)->count(),

                'disponibles' => Vehicules::disponible()
                    ->where('created_by', $user->id)
                    ->count(),

                'vendus_total' => Vehicules::vendu()
                    ->where('created_by', $user->id)
                    ->count(),

                // 'vendus_via_plateforme' => Vehicules::vendu()
                //     ->where('created_by', $user->id)
                //     ->where('transaction_method', 'rdv_plateforme')
                //     ->count(),

                // 'vendus_hors_plateforme' => Vehicules::vendu()
                //     ->where('created_by', $user->id)
                //     ->where('transaction_method', 'hors_plateforme')
                //     ->count(),

                'loues_total' => Vehicules::loue()
                    ->where('created_by', $user->id)
                    ->count(),

                'total_vues' => Vehicules::where('created_by', $user->id)
                    ->sum('views_count'),

                'rdv_en_cours' => Transactions::where('proprietaire_id', $user->id)
                    ->enAttente()
                    ->count(),

                'taux_conversion_plateforme' => $this->calculerTauxConversion($user->id),
            ];

            return response()->json([
                'success' => true,
                'data' => [$nosRdv, $stats]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Erreur sruvenue lors de la récupération",
                "errors" => $e->getMessage()
            ]);
        }
    }

    public function detailRdv($id): JsonResponse
    {
        try {
            $user = Auth::user();

            $transaction = Transactions::with([
                'vehicule.description',
                'vehicule.photos',
                'user:id,fullname,email,telephone,adresse',
                'proprietaire:id,fullname,email,telephone,adresse'
            ])
                ->where('id', $id)
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->orWhere('proprietaire_id', $user->id);
                })
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $transaction
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rendez-vous introuvable'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeRdv(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            // Validation des données
            $data = $request->validate([
                'vehicule_id' => 'required|exists:vehicules,id',
                'proprietaire_id' => 'required|exists:users,id',
                'numero_cni' => 'nullable|string|regex:/^[A-Z0-9]{10,15}$/', // Exemple de regex pour CNI
                'numero_permis' => 'nullable|string|regex:/^[A-Z0-9]{10,15}$/', // Exemple pour permis
                'date_rdv' => 'required|date',
                'heure_rdv' => 'required',
            ]);

            $vehicule = Vehicules::with('description')->findOrFail($data['vehicule_id']);
            if ($vehicule->statut != Vehicules::STATUS_DISPONIBLE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Véhicule non disponible pour la transaction',
                ], 400);
            }

            if ($vehicule->created_by  !== $data['proprietaire_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le propriétaire spécifié ne correspond pas au propriétaire du véhicule',
                ], 400);
            }

            if ($user->id === $data['proprietaire_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas prendre RDV pour votre propre véhicule',
                ], 400);
            }

            $dateRdv = Carbon::parse($data['date_rdv']);
            if ($dateRdv->isPast()) {
                return response()->json([
                    'success' => false,
                    'message' => 'La date du rendez-vous ne peut pas être dans le passé',
                ], 400);
            }
            DB::beginTransaction();

            $transaction = Transactions::create([
                'user_id' => $user->id,
                'proprietaire_id' => $data['proprietaire_id'], //input permet de recuperer des donnees meme si elles ne sont pas dans la validation
                'vehicule_id' => $data['vehicule_id'],
                'numero_cni' => $data['numero_cni'] ?? null,
                'numero_permis' => $data['numero_permis'] ?? null,
                'date_rdv' => $data['date_rdv'],
                'heure_rdv' => $data['heure_rdv'],
                'statut' => Transactions::STATUT_EN_ATTENTE,
            ]);

            try {
                $googleCalendar = new GoogleCalendarService($user);

                $startDateTime = Carbon::createFromFormat('Y-m-d H:i:s', $data['date_rdv'] . ' ' . $data['heure_rdv']);
                $endDateTime = (clone $startDateTime)->addHour();
                $endDateTime->modify('+1 hour');
                $proprietaire = User::find($data['proprietaire_id']);
                $summary = "RDV véhicule: {$vehicule->description->marque} {$vehicule->description->modele}";
                $description = "Rendez-vous avec {$user->fullname} pour le véhicule {$vehicule->description->marque} {$vehicule->description->modele}.\n\n"
                    . "Client: {$user->fullname} ({$user->email})\n"
                    . "Vendeur: {$proprietaire->fullname} ({$proprietaire->email})\n"
                    . "Prix: {$vehicule->prix} FCFA";
                $eventId = $googleCalendar->createEvent(
                    $summary,
                    $description,
                    $startDateTime,
                    $endDateTime,
                    $proprietaire->email
                );
                if ($eventId) {
                    $transaction->google_event_id = $eventId;
                    $transaction->save();
                }
            } catch (\Exception $e) {
                Log::error('Erreur Google Calendar: ' . $e->getMessage());
            }

            Notifications::create([
                'title' => 'Rendez-vous confirmé',
                'recever_id' => $user->id,
                'type' => Notifications::TYPE_SUCCESS,
                'message' => "Votre rendez-vous pour le {$data['date_rdv']} à {$data['heure_rdv']} a été enregistré.",
                'data' => json_encode([
                    'transaction_id' => $transaction->id,
                    'vehicule_id' => $vehicule->id,
                ]),
            ]);

            Notifications::create([
                'title' => 'Nouveau rendez-vous',
                'recever_id' => $data['proprietaire_id'],
                'type' => Notifications::TYPE_INFO,
                'message' => "{$user->fullname} a pris rendez-vous pour votre véhicule le {$data['date_rdv']} à {$data['heure_rdv']}.",
                'data' => json_encode([
                    'transaction_id' => $transaction->id,
                    'vehicule_id' => $vehicule->id,
                    'client_name' => $user->fullname,
                ]),
            ]);

            // Envoyer une notification au client (acheteur)
            Notifications::create([
                'title' => 'Votre rdv pour le véhicule a été créée avec succès',
                'recever_id' => $user->id,
                'type' => Notifications::TYPE_SUCCESS,
                'message' => 'Votre transaction pour le véhicule ' . $vehicule->marque . ' ' . $vehicule->modele . ' a été créée avec succès.',
                'data' => json_encode([
                    'transaction_id' => $transaction->id,
                    'vehicule_id' => $vehicule->id,
                    'date_rdv' => $data['date_rdv'],
                    'heure_rdv' => $data['heure_rdv']
                ]),
                'is_read' => false
            ]);

            // Envoyer une notification au propriétaire
            Notifications::create([
                'title' => 'Un rdv pour ce véhicule a été créé avec succès',
                'recever_id' => $data['proprietaire_id'],
                'type' => Notifications::TYPE_INFO,
                'message' => 'Une nouvelle transaction a été initiée pour votre véhicule ' . $vehicule->marque . ' ' . $vehicule->modele . ' par ' . $user->name . '.',
                'data' => json_encode([
                    'transaction_id' => $transaction->id,
                    'vehicule_id' => $vehicule->id,
                    'client_name' => $user->fullname,
                    'date_rdv' => $data['date_rdv'],
                    'heure_rdv' => $data['heure_rdv']
                ]),
                'is_read' => false
            ]);


            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Transaction créée avec succès',
                'data' => $transaction,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    //Annulation coté vendeur
    public function AnnulerRdv(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => "Utilisateur non authentifié"
                ], 401);
            }

            if ($user->role !== User::VENDEUR && $user->role !== User::PARTENAIRE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $rdv = Transactions::with('vehicule.description', 'user')->where('id', $id)
                ->where('proprietaire_id', $user->id)->firstOrFail();
            if ($rdv->statut !== Transactions::STATUT_EN_ATTENTE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette transaction a déjà été traitée'
                ], 400);
            }

            //Validation des motifs d'annulation
            //     $data = $request->validate([
            //     'motif_refus' => 'required|string|max:500',
            //     'dates_proposees' => 'nullable|array|min:1|max:3',
            //     'dates_proposees.*.date' => 'required|date|after:today',
            //     'dates_proposees.*.heure' => 'required|date_format:H:i',
            // ]);
            DB::beginTransaction();
            $rdv->update([
                'statut' => Transactions::STATUT_ANNULE,
                'annule_at' => now(),
                'refuse_at' => now(),
                // 'motif_refus' => $data['motif_refus'],
                // 'dates_proposees' => $data['dates_proposees'] ?? null,
                // 'note_proprietaire' => $data['motif_refus'],
            ]);

            // Suppression automatique de l'événement Google Calendar si présent
            try {
                if ($rdv->google_event_id && GoogleCalendarService::isUserConnected($rdv->user)) {
                    (new GoogleCalendarService($rdv->user))->deleteEvent($rdv->google_event_id);
                }
            } catch (\Exception $e) {
                Log::warning('Erreur suppression Google Calendar (Vendeur): ' . $e->getMessage());
            }

            Notifications::create([
                'recever_id' => $rdv->user_id,
                'type' => Notifications::TYPE_WARNING,
                'title' => 'Rendez-vous non disponible',
                // 'message' => $data['motif_refus'] .
                //     ($data['dates_proposees'] ?? false
                //         ? ' Le vendeur propose d\'autres dates.'
                //         : ''),
                'message' => "Votre demande de rendez-vous n'a pas été acceptée",
                'data' => [
                    'transaction_id' => $rdv->id,
                    'vehicule_id' => $rdv->vehicule_id,
                    // 'dates_proposees' => $data['dates_proposees'] ?? [],
                    // 'vehicules_similaires' => $vehiculesSimilaires->pluck('id'),
                    // 'action_requise' => 'choisir_nouvelle_date',
                ],
            ]);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => "Votre demande de rendez-vous n'a pas été accepté"
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du refus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //Annullation coté client
    public function annulerMonRdv(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => "Utilisateur non authentifié"
                ], 401);
            }

            if ($user->role !== User::CLIENT) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $monRdv = Transactions::with('vehicule.description', 'user')->where('id', $id)
                ->where('user_id', $user->id)->firstOrFail();
            if ($monRdv->statut !== Transactions::STATUT_EN_ATTENTE) {
                return response()->json([
                    'success' => false,
                    'message' => "Cette transaction a déjà été traitée"
                ], 400);
            }

            DB::beginTransaction();
            $monRdv->update([
                'statut' => Transactions::STATUT_ANNULE,
                'annule_at' => now(),
                'refuse_at' => now(),
                // 'motif_refus' => $data['motif_refus'],
                // 'dates_proposees' => $data['dates_proposees'] ?? null,
                // 'note_proprietaire' => $data['motif_refus'],
            ]);

            // Suppression de l'événement Google Calendar (Client)
            try {
                if ($monRdv->google_event_id && GoogleCalendarService::isUserConnected($monRdv->user)) {
                    (new GoogleCalendarService($monRdv->user))->deleteEvent($monRdv->google_event_id);
                }
            } catch (\Exception $e) {
                Log::warning('Erreur suppression Google Calendar (Client): ' . $e->getMessage());
            }

            Notifications::create([
                'recever_id'=> $monRdv->user_id,
                'type'=> Notifications::TYPE_INFO,
                'title'=> "Annulation de Rendez-vous",
                'message'=> 'Votre demande de rendez-vous a été annulé'
            ]);

            Notifications::create([
                'recever'=> $monRdv->proprietaire_id,
                'type'=> Notifications::TYPE_INFO,
                'title'=> "Rendez-vous annulé",
                'message'=> "Ce rendez-vous a été annulé par l'utilisateur"
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => "Votre Rendez-vous a été annulé",
                'data' => $monRdv
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du refus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function validerRdv(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => "Utilisateur non authentifié"
                ], 401);
            }

            if ($user->role !== User::VENDEUR && $user->role !== User::PARTENAIRE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $rdv = Transactions::with('vehicule.description', 'user')->where('id', $id)
                ->where('proprietaire_id', $user->id)->firstOrFail();
            if ($rdv->statut !== Transactions::STATUT_EN_ATTENTE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce rendez-vous a déjà été traitée'
                ], 400);
            }

            $vehicule = $rdv->vehicule;

            if ($vehicule->statut !== Vehicules::STATUS_DISPONIBLE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce véhicule n\'est plus disponible'
                ], 400);
            }

            if ($rdv->statut == Transactions::STATUT_CONFIRME) {
                return response()->json([
                    'success' => false,
                    'message' => "Ce rendez-vous à déjà été confirmé"
                ], 400);
            }

            if ($rdv->statut == Transactions::STATUT_ANNULE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de confirmer un rendez-vous déjà annulé'
                ], 400);
            }

            DB::beginTransaction();

            $rdv->update([
                'statut' => Transactions::STATUT_EFFECTUE,
                'confirme_at' => now(),
            ]);
            // $nouveauStatut = $vehicule->post_type === Vehicules::POST_TYPE_VENTE
            //     ? Vehicules::STATUS_VENDU
            //     : Vehicules::STATUS_LOUE;

            // $vehicule->update([
            //     'statut' => $nouveauStatut,
            //     'transaction_method' => 'rdv_plateforme',
            // ]);

            Notifications::create([
                'recever_id' => $rdv->user_id,
                'type' => Notifications::TYPE_SUCCESS,
                'title' => 'Transaction confirmée',
                'message' => 'Votre transaction pour le véhicule ' .
                    $vehicule->description->marque . ' ' .
                    $vehicule->description->modele . ' a été confirmée !',
                'data' => json_encode([
                    'transaction_id' => $rdv->id,
                    'vehicule_id' => $vehicule->id,
                ]),
            ]);

            Notifications::create([
                'recever_id' => $user->id,
                'type' => Notifications::TYPE_SUCCESS,
                'title' => 'Transaction confirmée',
                'message' => 'Vous avez confirmé la transaction avec ' .
                    $rdv->user->fullname,
                'data' => json_encode([
                    'transaction_id' => $rdv->id,
                    'vehicule_id' => $vehicule->id,
                ]),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction confirmée avec succès',
                'data' => $rdv->load('vehicule', 'user')
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction introuvable ou non autorisée'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la confirmation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
