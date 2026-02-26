<?php

namespace App\Http\Controllers;

use App\Models\Favori;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FavoriController extends Controller
{
    public function index(): JsonResponse
    {
        $favoris = Favori::with(['vehicule.description', 'vehicule.photos'])
            ->where('user_id', Auth::id())
            ->orderBy('date_ajout', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $favoris], 200);
    }

    public function store($vehiculeId): JsonResponse
    {
        $existing = Favori::where('user_id', Auth::id())
            ->where('vehicule_id', $vehiculeId)
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Déjà dans vos favoris'], 409);
        }

        $favori = Favori::create([
            'user_id'    => Auth::id(),
            'vehicule_id' => $vehiculeId,
        ]);

        return response()->json(['success' => true, 'message' => 'Ajouté aux favoris', 'data' => $favori], 201);
    }

    public function destroy($vehiculeId): JsonResponse
    {
        $deleted = Favori::where('user_id', Auth::id())
            ->where('vehicule_id', $vehiculeId)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Favori introuvable'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Retiré des favoris'
        ], 200);
    }
}
