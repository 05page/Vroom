<?php

namespace App\Http\Controllers;

use App\Models\LogModeration;
use App\Models\Notifications;
use App\Models\Signalement;
use App\Models\User;
use App\Models\Vehicules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Liste tous les comptes administrateurs.
     */
    public function admins(): JsonResponse
    {
        $admins = User::admins()
            ->select('id', 'fullname', 'email', 'telephone', 'adresse', 'niveau_acces', 'statut', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $admins], 200);
    }

    /**
     * Crée un nouveau compte administrateur.
     * Seul un admin connecté peut créer d'autres admins (route protégée par role:admin).
     */
    public function createAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'fullname'      => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8',
            'telephone'     => 'sometimes|nullable|string|max:20',
            'adresse'       => 'sometimes|nullable|string|max:500',
            'niveau_acces'  => 'sometimes|nullable|string|max:50',
        ]);

        $admin = User::create([
            'fullname'     => $request->fullname,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'role'         => User::ADMIN,
            'statut'       => User::ACTIF,
            'telephone'    => $request->telephone,
            'adresse'      => $request->adresse,
            'niveau_acces' => $request->niveau_acces,
        ]);

        $this->logAction('CREATE_ADMIN', 'utilisateur', $admin->id, "Création admin : {$admin->email}");

        return response()->json(['success' => true, 'data' => $admin, 'message' => 'Administrateur créé'], 201);
    }

    // ── Utilisateurs ──────────────────────────────────────

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role'))   $query->where('role', $request->role);
        if ($request->filled('statut')) $query->where('statut', $request->statut);

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json(['success' => true, 'data' => $users], 200);
    }

    public function suspendre(Request $request, $id): JsonResponse
    {
        return $this->changerStatut($id, User::SUSPENDU, 'SUSPEND_USER', 'utilisateur', $request->input('details'));
    }

    public function bannir(Request $request, $id): JsonResponse
    {
        return $this->changerStatut($id, User::BANNI, 'BAN_USER', 'utilisateur', $request->input('details'));
    }

    public function restaurer(Request $request, $id): JsonResponse
    {
        return $this->changerStatut($id, User::ACTIF, 'RESTORE_USER', 'utilisateur', $request->input('details'));
    }

    // Valider un compte concessionnaire / auto_ecole en attente
    public function validerCompte(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->statut !== User::EN_ATTENTE) {
            return response()->json(['success' => false, 'message' => 'Ce compte n\'est pas en attente de validation'], 422);
        }

        $user->restaurer(); // → statut = actif

        $this->logAction('VALIDATE_ACCOUNT', 'utilisateur', $id, $request->input('details'));

        return response()->json(['success' => true, 'message' => 'Compte validé'], 200);
    }

    // ── Véhicules ──────────────────────────────────────────

    public function vehiculesEnAttente(): JsonResponse
    {
        $vehicules = Vehicules::with(['creator:id,fullname,role', 'description'])
            ->enAttente()
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['success' => true, 'data' => $vehicules], 200);
    }

    /**
     * Liste tous les véhicules, tous statuts confondus.
     * Utilisé par le panel admin pour la vue de modération complète.
     */
    public function vehicules(): JsonResponse
    {
        $vehicules = Vehicules::with(['creator:id,fullname,role', 'description', 'photos'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $vehicules], 200);
    }

    public function validerVehicule(Request $request, $id): JsonResponse
    {
        $vehicule = Vehicules::findOrFail($id);
        $vehicule->update(['status_validation' => Vehicules::STATUS_VALIDATED]);

        $this->logAction('VALIDATE_VEHICLE', 'vehicule', $id, $request->input('details'));

        return response()->json(['success' => true, 'message' => 'Véhicule validé'], 200);
    }

    public function rejeterVehicule(Request $request, $id): JsonResponse
    {
        $request->validate(['details' => 'required|string|max:500']);

        $vehicule = Vehicules::findOrFail($id);
        $vehicule->update([
            'status_validation'      => Vehicules::STATUS_REJETEE,
            'description_validation' => $request->details,
        ]);

        $this->logAction('REJECT_VEHICLE', 'vehicule', $id, $request->details);

        return response()->json(['success' => true, 'message' => 'Véhicule rejeté'], 200);
    }

    // ── Signalements ───────────────────────────────────────

    public function signalements(Request $request): JsonResponse
    {
        $query = Signalement::with(['client:id,fullname', 'cibleUser:id,fullname', 'cibleVehicule.description', 'cibleVehicule.creator:id,fullname', 'cibleVehicule.photos']);

        if ($request->filled('statut')) $query->where('statut', $request->statut);
        // y

        $signalements = $query->orderBy('date_signalement', 'asc')->paginate(20);

        return response()->json(['success' => true, 'data' => $signalements], 200);
    }

    public function traiterSignalement(Request $request, $id): JsonResponse
    {
        // --- Étape 1 : Validation des paramètres ---
        $request->validate([
            'action'       => 'required|in:traiter,rejeter',
            'action_cible' => 'nullable|string|in:avertissement,suspendre,bannir,aucune',
            'note_admin'   => 'nullable|string|max:500',
        ]);

        // --- Étape 2 : Chargement du signalement avec ses relations ---
        $signalement = Signalement::with(['cibleUser', 'cibleVehicule.description'])->findOrFail($id);

        $action      = $request->input('action');
        $actionCible = $request->input('action_cible');
        $noteAdmin   = $request->input('note_admin');

        if ($action === 'traiter') {
            // --- Étape 3a : Marquer le signalement comme traité ---
            $signalement->traiter();

            // --- Étape 3b : Appliquer l'action sur la cible (user ou véhicule) ---
            if ($actionCible && $actionCible !== 'aucune') {

                if ($signalement->cibleUser) {
                    // "avertissement" : notif seulement, pas de changement de statut
                    match ($actionCible) {
                        'avertissement' => null,
                        'suspendre'     => $signalement->cibleUser->suspendre(),
                        'bannir'        => $signalement->cibleUser->bannir(),
                        default         => null,
                    };
                }

                if ($signalement->cibleVehicule) {
                    match ($actionCible) {
                        'suspendre' => $signalement->cibleVehicule->update(['statut' => 'suspendu']),
                        'bannir'    => $signalement->cibleVehicule->update(['statut' => 'banni']),
                        default     => null,
                    };
                }
            }

            // --- Étape 3c : Notification pour la cible ---
            // Destinataire : le user cible ou le créateur du véhicule signalé
            $cibleUserId = $signalement->cible_user_id
                ?? $signalement->cibleVehicule?->created_by;

            if ($cibleUserId) {
                $isCibleVehicule = (bool) $signalement->cible_vehicule_id;
                $titre = $isCibleVehicule
                    ? 'Action de modération sur votre annonce'
                    : 'Action de modération sur votre compte';

                $lignes = [$titre . '.'];
                if ($actionCible && $actionCible !== 'aucune') {
                    $lignes[] = "Mesure appliquée : {$actionCible}.";
                }
                if ($noteAdmin) {
                    $lignes[] = "Note de l'administrateur : {$noteAdmin}";
                }

                Notifications::create([
                    'user_id'    => $cibleUserId,
                    'type'       => Notifications::TYPE_MODERATION,
                    'title'      => $titre,
                    'message'    => implode(' ', $lignes),
                    'data'       => ['signalement_id' => $signalement->id, 'action_cible' => $actionCible],
                    'lu'         => false,
                    'date_envoi' => now(),
                ]);
            }

            // --- Étape 3d : Notification pour le reporter ---
            Notifications::create([
                'user_id'    => $signalement->client_id,
                'type'       => Notifications::TYPE_MODERATION,
                'title'      => 'Votre signalement a été traité',
                'message'    => 'Nous avons examiné votre signalement et pris les mesures appropriées.',
                'data'       => ['signalement_id' => $signalement->id],
                'lu'         => false,
                'date_envoi' => now(),
            ]);
        } else {
            // --- Étape 4 : Rejet du signalement — notification reporter uniquement ---
            $signalement->rejeter();

            $messageRejet = "Après examen, votre signalement n'a pas donné lieu à une action de notre part.";
            if ($noteAdmin) {
                $messageRejet .= " Précision de l'administrateur : {$noteAdmin}";
            }

            Notifications::create([
                'user_id'    => $signalement->client_id,
                'type'       => Notifications::TYPE_MODERATION,
                'title'      => 'Votre signalement a été examiné',
                'message'    => $messageRejet,
                'data'       => ['signalement_id' => $signalement->id],
                'lu'         => false,
                'date_envoi' => now(),
            ]);
        }

        // --- Étape 5 : Associer l'admin au signalement ---
        $signalement->update([
            'admin_id' => Auth::id(),
            'action_cible' => $actionCible,
            'note_admin'   => $noteAdmin ?: null,
        ]);

        // --- Étape 6 : Log avec détails complets ---
        $logDetails = "Action: {$action}";
        if ($actionCible) $logDetails .= ", Action cible: {$actionCible}";
        if ($noteAdmin)   $logDetails .= ", Note: {$noteAdmin}";

        $this->logAction('HANDLE_SIGNALEMENT', 'signalement', $id, $logDetails);

        return response()->json([
            'success' => true,
            'message' => $action === 'traiter' ? 'Signalement traité avec succès' : 'Signalement rejeté',
        ], 200);
    }

    public function logs(Request $request): JsonResponse
    {
        $query = LogModeration::with(['admin:id,fullname']);
            
        if ($request->filled('cible_type')) $query->where('cible_type', $request->cible_type);  
        $logs = $query->orderBy('date_action', 'desc')->paginate(50);

        return response()->json(['success' => true, 'data' => $logs], 200);
    }

    private function changerStatut($id, string $statut, string $action, string $cibleType, ?string $details): JsonResponse
    {
        $user = User::findOrFail($id);

        match ($statut) {
            User::SUSPENDU => $user->suspendre(),
            User::BANNI    => $user->bannir(),
            User::ACTIF    => $user->restaurer(),
        };

        $this->logAction($action, $cibleType, $id, $details);

        return response()->json(['success' => true, 'message' => 'Statut mis à jour : ' . $statut], 200);
    }

    private function logAction(string $action, string $cibleType, string $idCible, ?string $details): void
    {
        LogModeration::create([
            'admin_id'   => Auth::id(),
            'action'     => $action,
            'cible_type' => $cibleType,
            'id_cible'   => $idCible,
            'details'    => $details,
        ]);
    }
}
