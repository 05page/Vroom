<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Moderations;
use App\Models\Notifications;
use App\Models\Vehicules;
use App\Models\VehiculesDescription;
use App\Models\VehiculesPhotos;
use App\Models\VehiculeView;
use App\Services\GeminiService;
use Carbon\Carbon;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

use function Symfony\Component\Clock\now;

class VehiculesController extends Controller
{
    //Fonctions pour gérer les véhicules
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            $query = Vehicules::with([
                'creator:id,fullname,email,role',
                'description:*',
            ])->whereIn('status_validation', ['validee', 'restauree'])
                ->nonSignalesParUser($user->id)
                ->nonCreesParUsersBloque($user->id)
                ->where('statut', 'disponible')
                ->get();

            if ($query->count() == 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Aucun véhicule trouvé',
                    'data' => [],
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Véhicules récupérés avec succès',
                'data' => $query,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des véhicules: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function vehicule($id): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => "Utilisateur non authentifié"
                ], 401);
            }

            $vehicule = Vehicules::with([
                'creator:id,fullname,email',
                'description:*',
            ])->whereIn('status_validation', ['validee', 'restauree'])
                ->where('statut', 'disponible')
                ->findOrFail($id);


            $vehicule->registerView($user);
            return response()->json([
                'success' => true,
                'data'    => $vehicule,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Véhicule introuvable',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du véhicule',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function mesVehicules(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            if ($user->role !== "vendeur") {
                return response()->json([
                    'success' => false,
                    'message' => "Accès refusé"
                ], 403);
            }

            $vehicules = Vehicules::with([
                'creator:id,fullname,email',
                'description',
            ])
                ->where('created_by', $user->id)
                ->whereIn('status_validation', ['validee', 'restauree'])
                ->where('statut', 'disponible')
                ->get();

            $stats = [
                'total_vehicule' => Vehicules::disponible()->where('created_by', $user->id)->count(),
                'total_vehicule_vendu' => Vehicules::vendu()->where('created_by', $user->id)->count(),
                'total_vehicule_loue' => Vehicules::loue()->where('created_by', $user->id)->count(),
                'total_vues' => Vehicules::where('created_by', $user->id)->sum('views_count'),
                'total_revenus'=> Vehicules::vendu()->where('created_by', $user->id)->whereMonth('created_at', Carbon::now()->month)->sum('prix'),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Véhicules récupérés avec succès',
                'data' => [
                    'vehicules' => $vehicules,
                    'stats' => $stats
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des véhicules',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    public function mesStats(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            // Correction : si le rôle est "vendeur", on AUTORISE (c'était inversé)
            if ($user->role !== "vendeur" && $user->role !=="partenaire" && $user->role !== "admin") {
                return response()->json([
                    'success' => false,
                    'message' => 'Autorisation non accordée. Seuls les vendeurs peuvent accéder à ces statistiques.',
                ], 403);
            }

            $stats = [
                // Correction 1 : count au lieu de count (manquait les parenthèses)
                'total_vehicule' => Vehicules::disponible()->where('created_by', $user->id)->count(),   
                'total_vehicule_vendu' => Vehicules::vendu()->where('created_by', $user->id)->count(),
                'total_vehicule_loue' => Vehicules::loue()->where('created_by', $user->id)->count(),
                'total_vues' => Vehicules::where('created_by', $user->id)->sum('views_count'),
                'total_revenus'=> Vehicules::vendu()->where('created_by', $user->id)->whereMonth('created_at', Carbon::now()->month)->sum('prix'),

            ];

            $statsMensuel = [];
            for($mois = 1; $mois <=12; $mois++){
                $statsMensuel[] = [
                    'mois'=> $mois,
                    'nom_mois'=> Carbon::create()->month($mois)->locale('fr')->translatedFormat('F'),
                    'ventes'=> Vehicules::vendu()
                            ->where('created_by', $user->id)
                            ->whereMonth('created_at', $mois)
                            ->whereYear('created_at', Carbon::now()->year)
                            ->count(),
                            'vues' => VehiculeView::whereHas('vehicule', function($q) use ($user) {
                        $q->where('created_by', $user->id);
                    })
                    ->whereMonth('created_at', $mois)
                    ->whereYear('created_at', Carbon::now()->year)
                    ->count(),
                    'locations'=>Vehicules::loue()
                             ->whereMonth('created_at', $mois)
                            ->whereYear('created_at', Carbon::now()->year)
                            ->count()      
                ];
            }

            if($stats == [] && $statsMensuel == []){
                return response()->json([
                    'success'=>false,
                    'message'=>"Aucune stats disponible"
                ]);
            }

            $mostVuesVehicle = [
               //liste des 5 véhicules les plus vus
               'top_vehicle_most_vues'=> Vehicules::with('description')->where('created_by', $user->id)
               
               ->orderByDesc('views_count')
               ->limit(5)
               ->get(['id', 'prix', 'statut', 'views_count'])                 
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'stats'=> $stats,
                    'stats_mensuel'=> $statsMensuel,
                    'top_views_vehicle'=> $mostVuesVehicle
                ]
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Véhicule introuvable',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function postVehicules(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            if ($user->role !== 'vendeur' && $user->role !== 'partenaire') {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'avez pas la permission de poster un véhicule',
                ], 403);
            }

            //Créer un nouveau véhicule (Ajoutons les descriptions et photos)
            $validatedData = $request->validate([
                'post_type' => ['required', Rule::in([
                    Vehicules::POST_TYPE_VENTE,
                    Vehicules::POST_TYPE_LOCATION
                ])],
                'type' => ['required', Rule::in([
                    Vehicules::VEHICLE_TYPE_NEUF,
                    Vehicules::VEHICLE_TYPE_OCCASION
                ])],
                'prix' => 'required|numeric',
                'date_disponibilite' => 'nullable|date',

                'marque' => 'required|string|max:500',
                'modele' => 'required|string|max:500',
                'annee' => 'nullable|digits:4|integer',
                'carburant' => 'nullable|string|max:100',
                'transmission' => 'nullable|string|max:100',
                'kilometrage' => 'nullable|integer',
                'couleur' => 'nullable|string|max:100',
                'nombre_portes' => 'nullable|integer',
                'nombre_places' => 'nullable|integer',
                'visite_technique' => ['nullable', Rule::in([
                    'à_jour',
                    'expirée',
                    'non_concerné'
                ])],
                'date_visite_technique' => 'nullable|date',
                'carte_grise' => ['nullable', Rule::in([
                    'à_jour',
                    'expirée',
                    'non_concerné'
                ])],
                'date_carte_grise' => 'nullable|date',
                'assurance' => ['nullable', Rule::in([
                    'à_jour',
                    'expirée',
                    'non_concerné'
                ])],
                'historique_accidents' => ['nullable', Rule::in([
                    'aucun',
                    'quelques_accidents',
                    'nombreux_accidents'
                ])],
                'equipements' => 'nullable|array',

                // Photos
                //'photos' => 'nullable|array',
                //'photos.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            if (!$validatedData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                ], 400);
            }

            // Validation avec Gemini pour vérifier la cohérence des données
            $prompt = "Analysez ce véhicule " . ($validatedData['type'] == 'occasion' ? 'd\'occasion' : 'neuf') . " : " .
                "marque {$validatedData['marque']}, modèle {$validatedData['modele']}, année {$validatedData['annee']}, " .
                "carburant {$validatedData['carburant']}, kilométrage {$validatedData['kilometrage']} km, " .
                "historique d'accidents: {$validatedData['historique_accidents']}, " .
                "équipements: " . implode(', ', $validatedData['equipements'] ?? []) . ". " .
                "Répondez au format JSON strict : {\"valide\": true/false, \"prix_suggere\": nombre, \"explication\": \"texte\"}. " .
                "Le prix doit être en FCFA (XOF) basé sur le marché ivoirien. " .
                "Si invalide, mettez valide à false et expliquez pourquoi.";

            try {
                $geminiResponse = retry(3, function () use ($prompt) {
                    return Gemini::generativeModel(model: 'gemini-2.5-flash')
                        ->generateContent($prompt);
                }, 2000);

                $responseText = trim($geminiResponse->text());
                $responseText = preg_replace('/```json\n?|\n?```/', '', $responseText);
                $aiResult = json_decode($responseText, true);
                if (!$aiResult || !isset($aiResult['valide'])) {
                    throw new \Exception('Format de réponse invalide de l\'IA');
                }

                if (!$aiResult['valide']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Le véhicule n\'a pas été validé',
                        'details' => $aiResult['explication'] ?? 'Données incohérentes',
                    ], 400);
                }
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la validation avec Gemini: ' . $e->getMessage(),
                ], 500);
            }

            DB::beginTransaction();
            $vehicule = Vehicules::create([
                'created_by' => $user->id,
                'post_type' => $validatedData['post_type'],
                'type' => $validatedData['type'],
                'statut' => Vehicules::STATUS_DISPONIBLE,
                'status_validation' => Vehicules::STATUS_VALIDATED,
                'prix' => $validatedData['prix'],
                'prix_suggere' => $aiResult['prix_suggere'],
                'negociable' => false,
                'date_disponibilite' => now(),
            ]);

            $vehiculeDescription = VehiculesDescription::create([
                'vehicule_id' => $vehicule->id,
                'marque' => $validatedData['marque'],
                'modele' => $validatedData['modele'],
                'annee' => $validatedData['annee'] ?? null,
                'carburant' => $validatedData['carburant'] ?? null,
                'transmission' => $validatedData['transmission'] ?? null,
                'kilometrage' => $validatedData['kilometrage'] ?? null,
                'couleur' => $validatedData['couleur'] ?? null,
                'nombre_portes' => $validatedData['nombre_portes'] ?? null,
                'nombre_places' => $validatedData['nombre_places'] ?? null,
                'visite_technique' => $validatedData['visite_technique'] ?? null,
                'date_visite_technique' => $validatedData['date_visite_technique'] ?? null,
                'carte_grise' => $validatedData['carte_grise'] ?? null,
                'date_carte_grise' => $validatedData['date_carte_grise'] ?? null,
                'assurance' => $validatedData['assurance'] ?? null,
                'historique_accidents' => $validatedData['historique_accidents'] ?? null,
                'equipements' => $validatedData['equipements'] ?? null,
            ]);

            //Uploader les photos si présentes
            // if ($request->hasFile('photos')) {
            //     foreach ($request->file('photos') as $index => $photo) {
            //         $path = $photo->store('vehicules_photos', 'public');

            //         VehiculesPhotos::create([
            //             'vehicule_id' => $vehicule->id,
            //             'path' => $path,
            //             'is_primary' => $index === 0,
            //             'position' => $index + 1,
            //         ]);
            //     }
            // }

            Notifications::create([
                'recever_id' => $user->id,
                'title' => 'Véhicule créé avec succès',
                'type' => Notifications::TYPE_SUCCESS,
                'message' => 'Votre véhicule ' . $vehiculeDescription->marque . ' ' . $vehiculeDescription->modele . ' a été créé avec succès.',
                'data' => json_encode([
                    'vehicule_id' => $vehicule->id,
                ]),
            ]);

            Moderations::create([
                'moderatable_type' => 'App\Models\Vehicules',
                'moderable_id' => $vehicule->id,
                'admin_id' => $user->id,
                'action' => Moderations::ACTION_VALIDATION,
                'description' => "Validation du véhicule",
                'status' => "decision_finale",
                'decision_at' => now()
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Véhicule créé avec succès',
                'data' => [
                    'vehicule' => $vehicule,
                    'description' => $vehicule->description,
                    'photos' => $vehicule->photos,
                    'prix_suggere' => $aiResult['prix_suggere'],
                    'explication_prix' => $aiResult['explication'],
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du véhicule',
                'errors' =>  $e->getMessage(),
            ], 500);
        }
    }

    public function updateVehicule() {}
    public function deleteVehicule() {}

}
