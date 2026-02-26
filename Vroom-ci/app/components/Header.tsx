"use client";

import { usePathname } from "next/navigation";
import {
    Bell,
    Calendar,
    Car,
    ChevronDown,
    Heart,
    Home,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageCircle,
    User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/src/lib/api";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/context/UserContext";
import { useNotification } from "@/src/context/NotificationContext";

const Header = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { unreadCount } = useNotification()
    const router = useRouter();

    const isVendeur = user?.role === "vendeur";

    if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/Auth") ||
        pathname.startsWith("/partenaire")
    )
        return null;

    const navLinks = [
        { href: "/", label: "Accueil", icon: Home },
        { href: "/vehicles", label: "Véhicules", icon: Car },
        ...(!isVendeur
            ? [{ href: "/client/favorites", label: "Favoris", icon: Heart }]
            : []),
        {
            href: isVendeur ? "/vendeur/rdv" : "/client/rdv",
            label: "Rendez-vous",
            icon: Calendar,
        },
    ];

    const handleLogout = async () => {
        await api.logout();
        router.push("/auth");
    };

    const roleDot = isVendeur ? "bg-emerald-500" : "bg-amber-500";
    const roleLabel = isVendeur ? "Vendeur" : "Client";

    return (
        <>
            {/* ── DESKTOP HEADER ── */}
            <header className="fixed top-0 left-0 right-0 z-50 hidden md:flex items-center">
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md border-b border-zinc-200" />

                <div className="relative w-full max-w-7xl mx-auto flex h-14 items-center justify-between px-6">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm group-hover:shadow-amber-200 group-hover:shadow-md transition-shadow duration-200">
                            <Car className="h-4 w-4 text-white fill-white" />
                        </div>
                        <span
                            className="text-base font-bold text-zinc-900 tracking-tight"
                            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                        >
                            Vroom
                        </span>
                    </Link>

                    {/* Nav center */}
                    <nav className="flex items-center gap-0.5">
                        {navLinks.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${active
                                            ? "bg-zinc-100 text-zinc-900"
                                            : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                                        }`}
                                >
                                    <item.icon className="h-3.5 w-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right */}
                    <div className="flex items-center gap-1">
                        <Link
                            href={isVendeur ? "/vendeur/messages" : "/client/messages"}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Link>
                        <Link
                            href={isVendeur ? "/vendeur/notifications" : "/client/notifications"}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
                        >
                            <div className="relative">
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>

                                )}
                            </div>
                        </Link>

                        <div className="w-px h-5 bg-zinc-200 mx-1" />

                        {/* Profile dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
                            >
                                <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center">
                                    <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs font-semibold text-zinc-800 leading-none">
                                        {user?.fullname?.split(" ")[0] ?? "Profil"}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 leading-none mt-0.5 flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${roleDot}`} />
                                        {roleLabel}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`h-3 w-3 text-zinc-400 transition-transform duration-150 ${profileOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {profileOpen && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-100 overflow-hidden"
                                    onMouseLeave={() => setProfileOpen(false)}
                                >
                                    <div className="px-3 py-2.5 border-b border-zinc-100">
                                        <p className="text-xs font-semibold text-zinc-800">{user?.fullname}</p>
                                        <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
                                    </div>
                                    <div className="p-1.5">
                                        <Link
                                            href={isVendeur ? "/vendeur/dashboard" : "/client/profile"}
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                                        >
                                            <LayoutDashboard className="h-3.5 w-3.5" />
                                            {isVendeur ? "Dashboard" : "Mon compte"}
                                        </Link>
                                    </div>
                                    <div className="p-1.5 border-t border-zinc-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                        >
                                            <LogOut className="h-3.5 w-3.5" />
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── MOBILE HEADER ── */}
            <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md border-b border-zinc-200" />

                <div className="relative flex h-14 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                            <Car className="h-3.5 w-3.5 text-white fill-white" />
                        </div>
                        <span className="text-sm font-bold text-zinc-900" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                            Vroom
                        </span>
                    </Link>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-all cursor-pointer"
                    >
                        <Menu className="h-4 w-4" />
                    </button>
                </div>

                {mobileOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
                        <div
                            className="absolute top-14 left-0 right-0 bg-white border-b border-zinc-200 shadow-xl p-4 space-y-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* User info */}
                            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-50 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-800">{user?.fullname}</p>
                                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${roleDot}`} />
                                        {roleLabel}
                                    </p>
                                </div>
                            </div>

                            {navLinks.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${active ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"}`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}

                            <div className="h-px bg-zinc-100 my-2" />

                            <Link
                                href={isVendeur ? "/vendeur/dashboard" : "/client/profile"}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-all"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                {isVendeur ? "Dashboard" : "Mon compte"}
                            </Link>

                            <Link
                                href={isVendeur ? "/vendeur/messages" : "/client/messages"}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-all"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Messages
                            </Link>

                            <div className="h-px bg-zinc-100 my-2" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;
