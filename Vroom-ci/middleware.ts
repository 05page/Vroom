import { NextRequest, NextResponse } from "next/server";
import { getDashBoard, hasRouteAccess, isPublicRoute } from "@/src/core/auth/permission";
import { UserRole } from "@/src/types";
export default function middleware(req: NextRequest){
    const token = req.cookies.get("auth_token");
    if(token == undefined){
        return NextResponse.redirect(new URL('/auth', req.url))
    }else{
        const role = (req.cookies.get("user_role")?.value || "client") as UserRole;
        const path = req.nextUrl.pathname;
        if(isPublicRoute(path)) return NextResponse.next()
        if(!hasRouteAccess(role, path)){
            return NextResponse.redirect(new URL(getDashBoard(role), req.url))
        }
        return NextResponse.next()
    }
}

export const config = {
    matcher: ['/vendeur/:path*', '/client/:path*', '/partenaire/:path*', '/admin/:path*']
}