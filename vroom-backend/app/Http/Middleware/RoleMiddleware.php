<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if(!Auth::check()){
            return response()->json([
                'success'=> false,
                'message'=> "Utilisateur non authentifié",
            ], 401);
        }

        $userRole = Auth::user()->role;
        if(!in_array($userRole, $roles)){
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Vous n\'avez pas les autorisations nécessaires.',
                'required_roles' => $roles,
                'your_role' => $userRole,
            ], 403);
        }
        return $next($request);
    }
}
