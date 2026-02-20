<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function redirect(string $provider)
    {
        if ($provider !== 'google') {
            return response()->json(['error' => 'Unsupported provider'], 400);
        }

        return Socialite::driver('google')
            ->scopes([
                'https://www.googleapis.com/auth/calendar.events'
            ])
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
            ])
            ->stateless()
            ->redirect();
    }

    public function callback(string $provider)
    {
        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
            //dd($socialUser->token, $socialUser->refreshToken, $socialUser->expiresIn);
            $tokenData = [
                'access_token' => $socialUser->token,
                'refresh_token' => $socialUser->refreshToken,
                'expires_in' => $socialUser->expiresIn ?? 3600,
                'created' => time(),
            ];
            $user = User::updateOrCreate(
                ['google_id' => $socialUser->id],
                [
                    'fullname' => $socialUser->name,
                    'email' => $socialUser->email,
                    'password' => Hash::make(Str::random(24)),
                    'google_access_token' => $tokenData,
                    'google_token_expires_at' => now()->addSeconds($tokenData['expires_in']),

                ]
            );

            if (!$user->email_verified_at) {
                $user->email_verified_at = now();
                $user->save();
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Rediriger vers Next.js avec le token pour stockage en cookie httpOnly
            $redirectUrl = config('app.frontend_url', 'http://localhost:3000') . "/api/auth/callback?" . http_build_query([
                'token' => $token,
                'data'=> $user,
                'role' => $user->role ?? 'client',
            ]);

            return redirect($redirectUrl);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error during authentication',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePhoneAndAddress(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Utilisateur non authentifié'], 401);
            }

            $validatedData = $request->validate([
                'role' => 'sometimes|string|max:10',
                'telephone' => 'sometimes|string|max:10',
                'adresse' => 'sometimes|string|max:500',
            ]);

            DB::beginTransaction();

            if (!$user->active) {
                $user->active = true;
                $user->save();
            }

            $user->update($validatedData);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Informations utilisateur mises à jour avec succès',
                'user' => $user
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getInfoUser(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'error' => 'Utilisateur non authentifié'], 401);
            }

            return response()->json([
                'success'=> true,
                'data'=> $user
                ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des informations utilisateur'
            ], 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user || $user->id != Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié ou non autorisé',
                ], 401);
            }

            $data = $request->validate([
                'fullname' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'telephone' => 'sometimes|string|max:10',
                'adresse' => 'sometimes|string|max:500',
            ]);

            $user->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'utilisateur',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Successfully logged out']);
    }
}
