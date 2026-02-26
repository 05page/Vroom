<?php

namespace App\Http\Controllers;

use App\Models\Alerte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AlerteController extends Controller
{
    public function index(): JsonResponse
    {
        $alertes = Alerte::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $alertes], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'marque_cible' => 'nullable|string|max:100',
            'modele_cible' => 'nullable|string|max:100',
            'prix_max'     => 'nullable|numeric|min:0',
            'carburant'    => ['nullable', Rule::in(['essence', 'diesel', 'electrique', 'hybride', 'GPL'])],
        ]);

        if (empty(array_filter($validated))) {
            return response()->json([
                'success' => false,
                'message' => 'Au moins un critère est requis pour créer une alerte',
            ], 422);
        }

        $alerte = Alerte::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return response()->json(['success' => true, 'message' => 'Alerte créée', 'data' => $alerte], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $alerte = Alerte::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'marque_cible' => 'nullable|string|max:100',
            'modele_cible' => 'nullable|string|max:100',
            'prix_max'     => 'nullable|numeric|min:0',
            'carburant'    => ['nullable', Rule::in(['essence', 'diesel', 'electrique', 'hybride', 'GPL'])],
            'active'       => 'sometimes|boolean',
        ]);

        $alerte->update($validated);

        return response()->json(['success' => true, 'message' => 'Alerte mise à jour', 'data' => $alerte], 200);
    }

    public function destroy($id): JsonResponse
    {
        $deleted = Alerte::where('id', $id)->where('user_id', Auth::id())->delete();

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Alerte introuvable'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Alerte supprimée'], 200);
    }
}
