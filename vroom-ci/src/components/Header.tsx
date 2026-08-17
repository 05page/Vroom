"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, Compass, type LucideIcon, Bell, Heart, Send, Calendar, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Notifications from "./Notifications";
import type { RoleUser } from "@/types";

/**
 * DUPLIQUÉ depuis DESTINATION_PAR_ROLE (app/auth/page.tsx) et ACCUEIL_PAR_ROLE
 * (api/auth/callback/route.ts) — 3e copie de la même table. À consolider dans
 * un seul endroit partagé si ça recommence à diverger.
 */
const DESTINATION_PAR_ROLE: Record<RoleUser, string> = {
  client: "/client/profile",
  vendeur: "/vendeur/profile",
  concessionnaire: "/partenaire/concessionnaire/dashboard",
  auto_ecole: "/partenaire/auto_ecole/dashboard",
  admin: "/",
};

type HeaderProps = {
  estConnecte: boolean;
  role: RoleUser | null;
};

/** Classes d'un lien de la nav desktop, extraites pour ne pas dupliquer la chaîne. */
const CLASSES_LIEN_NAV =
  "lien-anime flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

/**
 * Un lien de navigation du header : le libellé affiché, la route Next,
 * et l'icône Lucide À AFFICHER.
 *
 * `icone: LucideIcon` stocke le COMPOSANT lui-même (la référence `Compass`),
 * pas son nom en texte ("Compass"). Une string obligerait à écrire une table
 * de correspondance string -> composant pour pouvoir la rendre : inutile.
 */
export type LienNav = {
  libelle: string;
  href: string;
  icone: LucideIcon;
};

const LIENS_NAV: LienNav[] = [
  { libelle: "Découvrir", href: "/vehicules", icone: Compass },
  { libelle: "Favoris", href: "/client/favoris", icone: Heart },
  { libelle: "Rendez-vous", href: "/client/rdv", icone: Calendar },
  //{ libelle: "Vendre", href: "/vendeur/vehicules/nouveau", icone: Tag },
  //{ libelle: "Partenaires", href: "/partenaire", icone: Building2 },
];

export default function Header({ estConnecte, role }: HeaderProps) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const navigate = useRouter();

  const hrefCompte = estConnecte && role ? DESTINATION_PAR_ROLE[role] : "/auth";
  const libelleCompte = estConnecte ? "Mon compte" : "Connexion";

  /**
   * `auth_token` est httpOnly : seul /api/auth/logout (côté serveur) peut
   * l'effacer. `router.refresh()` force RootLayout à relire les cookies —
   * sans lui, `estConnecte` resterait vrai jusqu'au prochain rechargement.
   */
  const seDeconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    navigate.push("/auth");
    navigate.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/">
          <img src="/logo.svg" alt="move-ci" className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LIENS_NAV.map((lien) => (
            <Link key={lien.href} href={lien.href} className={CLASSES_LIEN_NAV}>
              <lien.icone className="size-4" />
              <span>{lien.libelle}</span>
            </Link>
          ))}

        </nav>

        {/* Bouton + burger regroupés, sinon justify-between les éparpille */}
        <div className="flex items-center gap-2">
          <Notifications notifs={[]} nonLues={0} />
          <button onClick={() => navigate.push("/messages")}>
            <Send className="size-4" />
          </button>
          {estConnecte ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Mon compte"
                className="hidden size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
              >
                <User className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem render={<Link href={hrefCompte} />}>
                  <User className="size-4" />
                  Mon compte
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={seDeconnecter}>
                  <LogOut className="size-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // render = le asChild de Base UI : rend un vrai <a href>, pas un <button>
            <Button
              render={<Link href={hrefCompte} />}
              className="effet-action hidden md:inline-flex"
            >
              <User className="size-4" />
              {libelleCompte}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOuvert}
            aria-controls="menu-mobile"
          >
            {menuOuvert ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {menuOuvert && (
        <nav id="menu-mobile" className="border-t p-2 md:hidden">
          {LIENS_NAV.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              onClick={() => setMenuOuvert(false)}
              className="flex items-center gap-3 rounded-4xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <lien.icone className="size-4" />
              <span>{lien.libelle}</span>
            </Link>
          ))}

          {/* Le CTA est masqué dans la barre sous 768px : il réapparaît ici */}
          <Button
            render={<Link href={hrefCompte} />}
            className="effet-action mt-1 w-full"
            onClick={() => setMenuOuvert(false)}
          >
            <User className="size-4" />
            {libelleCompte}
          </Button>

          {estConnecte && (
            <button
              type="button"
              onClick={() => {
                setMenuOuvert(false);
                seDeconnecter();
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-4xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Déconnexion
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
