//permission
import { UserRole } from "@/src/types";

const  ROLE_ROUTES: Record<UserRole, string[]> = {
    admin: ["*"],
    vendeur: ["/vendeur"],
    concessionnaire: ["/partenaire"],
    auto_ecole: ["/partenaire"],
    client: ["/client"]
}

const ROLE_DASHBOARD: Record<UserRole, string> = {
    admin: "/admin/dashboard",
    vendeur: "/vendeur/dashboard",
    concessionnaire: "/partenaire/dashboard",
    auto_ecole: "/partenaire/dashboard",
    client: "/client/profile"
}

export const PUBLIC_ROUTES = ["/auth", "/auth/callback"];

export function isAdmin(role: UserRole) {
    return role === "admin";
}   

export function getDashBoard(role: UserRole) {
    return ROLE_DASHBOARD[role] || "/auth";
}

export function hasRouteAccess(role:UserRole, pathname:string):boolean
{
    const allowedRoutes = ROLE_ROUTES[role];
    if(allowedRoutes.includes("*")) return true; //includes vérifie si un tableau contient une valeur spécifique
    return allowedRoutes.some(route => pathname.startsWith(route)); //some vérifie si au moins un élément du tableau satisfait une condition donnée
}

export function isPublicRoute(pathname:string):boolean
{
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route)); //startsWith vérifie si une chaîne de caractères commence par une autre chaîne de caractères spécifiée
}
