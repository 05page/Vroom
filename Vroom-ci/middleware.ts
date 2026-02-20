import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest){
    const token = req.cookies.get("auth_token");
    if(token == undefined){
        return NextResponse.redirect(new URL('/auth', req.url))
    }else{
        const role = req.cookies.get("user_role")?.value || "client";
        const path = req.nextUrl.pathname;
        const dasboardByRole : Record<string, string> = { //Record sert à typer un objet dont les clés et les valeurs ont des types spécifiques
            "vendeur": "/vendeur/dashboard",
            "admin": "/admin/dashboard",    
            "partenaire": "/partenaire/dashboard",
            "client": "/client/dashboard"
        }
        const dashboardPath = dasboardByRole[role] || "/client/dashboard";
        if(path.startsWith("/vendeur") && role !== "vendeur"){
            return NextResponse.redirect(new URL(dashboardPath, req.url))
        }
        if(path.startsWith("/admin") && role !== "admin"){
            return NextResponse.redirect(new URL(dashboardPath, req.url))
        }
        if(path.startsWith("/partenaire") && role !== "partenaire"){
            return NextResponse.redirect(new URL(dashboardPath, req.url))
        }   
        if(path.startsWith("/client") && role !== "client"){
            return NextResponse.redirect(new URL(dashboardPath, req.url))
        }
         
        return NextResponse.next()
    }
}

export const config = {
    matcher: ['/vendeur/:path*', '/client/:path*', '/partenaire/:path*']
}