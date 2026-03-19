<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\GeocodingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeolocalisationController extends Controller
{
    /**
     * Retourne les vendeurs/partenaires proches d'un point GPS.
     *
     * Query params :
     *   - lat    : latitude du centre (float, requis)
     *   - lng    : longitude du centre (float, requis)
     *   - rayon  : distance max en km (int, défaut 20)
     *   - role   : filtre rôle (vendeur|concessionnaire|auto_ecole, optionnel)
     */
    public function proches(Request $request): JsonResponse
    {
        $request->validate([
            'lat'   => 'required|numeric|between:-90,90',
            'lng'   => 'required|numeric|between:-180,180',
            'rayon' => 'sometimes|integer|min:1|max:200',
            'role'  => 'sometimes|in:vendeur,concessionnaire,auto_ecole',
        ]);

        $lat   = (float) $request->lat;
        $lng   = (float) $request->lng;
        $rayon = (int)   ($request->rayon ?? 20);

        // Rôles autorisés sur la carte (pas les clients ni les admins)
        $roles = $request->filled('role')
            ? [$request->role]
            : ['vendeur', 'concessionnaire', 'auto_ecole'];

        /*
         * Formule Haversine en SQL :
         * distance = 6371 * acos(
         *   cos(radians(lat_centre)) * cos(radians(latitude))
         *   * cos(radians(longitude) - radians(lng_centre))
         *   + sin(radians(lat_centre)) * sin(radians(latitude))
         * )
         * Retourne la distance en kilomètres.
         */
        $results = User::selectRaw("
                id, fullname, role, adresse, avatar,
                note_moyenne, raison_sociale,
                latitude, longitude, statut,
                (
                    6371 * acos(
                        cos(radians(?)) * cos(radians(latitude))
                        * cos(radians(longitude) - radians(?))
                        + sin(radians(?)) * sin(radians(latitude))
                    )
                ) AS distance
            ", [$lat, $lng, $lat])
            ->whereIn('role', $roles)
            ->where('statut', User::ACTIF)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->having('distance', '<=', $rayon)
            ->orderBy('distance')
            ->limit(50)
            ->get();

        return response()->json(['success' => true, 'data' => $results]);
    }

    /**
     * Met à jour manuellement les coordonnées GPS de l'utilisateur connecté
     * à partir de sa position navigateur (lat/lng envoyés directement).
     */
    public function updatePosition(Request $request): JsonResponse
    {
        $request->validate([
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $request->user()->update([
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json(['success' => true, 'message' => 'Position mise à jour']);
    }

    /**
     * Géocode une adresse via Nominatim et met à jour les coordonnées de l'utilisateur.
     * Utile quand le vendeur renseigne son adresse sans utiliser le GPS.
     */
    public function geocodeAdresse(Request $request): JsonResponse
    {
        $request->validate(['adresse' => 'required|string|max:500']);

        $coords = (new GeocodingService())->geocode($request->adresse);

        if (!$coords) {
            return response()->json([
                'success' => false,
                'message' => 'Adresse introuvable — essayez d\'être plus précis',
            ], 422);
        }

        $request->user()->update($coords);

        return response()->json([
            'success' => true,
            'data'    => $coords,
            'message' => 'Coordonnées mises à jour',
        ]);
    }
}

