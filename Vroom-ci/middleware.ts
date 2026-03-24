import { NextRequest, NextResponse } from "next/server";
import { getDashBoard, hasRouteAccess, isPublicRoute } from "@/src/core/auth/permission";
import { UserRole } from "@/src/types";
export default function middleware(req: NextRequest){
    const token = req.cookies.get("auth_token");
    const path = req.nextUrl.pathname;

    if(token == undefined){
        return NextResponse.redirect(new URL('/auth', req.url))
    }

    const onboardingPending = req.cookies.get("onboarding_pending")?.value === "1"

    if(onboardingPending) {
        // Bloquer toutes les routes sauf /onboarding tant que l'onboarding n'est pas terminé
        if(path !== "/onboarding") return NextResponse.redirect(new URL('/onboarding', req.url))
        // Sur /onboarding → laisser passer sans passer par hasRouteAccess
        return NextResponse.next()
    }

    // User déjà onboardé qui tente d'accéder à /onboarding → dashboard
    if(path === "/onboarding"){
        const role = (req.cookies.get("user_role")?.value || "client") as UserRole;
        return NextResponse.redirect(new URL(getDashBoard(role), req.url))
    }

    const role = (req.cookies.get("user_role")?.value || "client") as UserRole;
    if(isPublicRoute(path)) return NextResponse.next()
    if(!hasRouteAccess(role, path)){
        return NextResponse.redirect(new URL(getDashBoard(role), req.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/vendeur/:path*', '/client/:path*', '/partenaire/:path*', '/admin/:path*', '/onboarding']
}