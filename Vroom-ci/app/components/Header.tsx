"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    Menubar,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, Calendar, Car, Heart, Home, LayoutDashboard, LogOut, Menu, MessageCircle, User as UserIcon } from "lucide-react"
import Link from "next/link";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/src/lib/api";
import { useRouter } from 'next/navigation'
import { useUser } from "@/src/context/UserContext";

const Header = () => {
    const pathname = usePathname()
    const {user} = useUser()
    const [mobileOpen, setMobileOpen] = useState(false)
    const isVendeur = user?.role === "vendeur"

    if (pathname.startsWith("/auth") || pathname.startsWith("/Auth") || pathname.startsWith("/partenaire")) return null

    const navItems = [
        { href: "/", label: "Accueil", icon: Home },
        { href: "/vehicles", label: "Véhicules", icon: Car },
        ...(isVendeur ? [] : [{ href: "/client/favorites", label: "Favoris", icon: Heart }]),
        { href: isVendeur ? "/vendeur/notifications" : "/client/notifications", label: "Notifications", icon: Bell },
    ]

    const menuItems = [
        { href: isVendeur ? "/vendeur/dashboard" : "/client/profile", label: isVendeur ? "Mon dashboard" : "Mon compte", icon: LayoutDashboard },
        { href: isVendeur ? "/vendeur/rdv" : "/client/rdv", label: "Mes Rendez-vous", icon: Calendar },
        { href: isVendeur ? "/vendeur/messages" : "/messages", label: "Messages", icon: MessageCircle },
    ]
    const router = useRouter();
    const handleLogout = async () => {
        await api.logout()
        router.push("/auth")
    }
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                        <Car className="h-4 w-4 text-white" />
                    </div>
                </Link>

                {/* Desktop: Navigation center */}
                <Menubar className="border-none bg-transparent shadow-none hidden md:flex">
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer text-zinc-600 hover:text-zinc-900 font-medium text-sm data-[state=active]:border-r-black">
                            <Link href="/" className="flex items-center">
                                <Home className="mr-2 h-4 w-4" />
                                Accueil
                            </Link>
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer text-zinc-600 hover:text-zinc-900 font-medium text-sm">
                            <Link href="/vehicles" className="flex items-center">
                                <Car className="mr-2 h-4 w-4" />
                                Véhicules
                            </Link>
                        </MenubarTrigger>
                    </MenubarMenu>

                    {!isVendeur && (
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer text-zinc-600 hover:text-zinc-900 font-medium text-sm">
                                <Link href="/client/favorites" className="flex items-center">
                                    <Heart className="mr-2 h-4 w-4" />
                                    Favoris
                                </Link>
                            </MenubarTrigger>
                        </MenubarMenu>
                    )}

                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer text-zinc-600 hover:text-zinc-900 font-medium text-sm">
                            <Link href={isVendeur ? "/vendeur/rdv" : "/client/rdv"} className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                Rendez-vous
                            </Link>
                        </MenubarTrigger>
                    </MenubarMenu>
                </Menubar>

                {/* Desktop: Profile right */}
                <div className="hidden md:flex items-center">
                    <Menubar className="border-none bg-transparent shadow-none">
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer text-zinc-600 hover:text-zinc-900 font-medium text-sm">
                                <Link href={isVendeur ? "/vendeur/messages" : "/client/messages"} className="flex items-center">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                </Link>
                            </MenubarTrigger>
                        </MenubarMenu>

                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer text-zinc-600 hover:text-zinc-900 font-medium text-sm">
                                <Link href={isVendeur ? "/vendeur/notifications" : "/client/notifications"} className="flex items-center">
                                    <Bell className="mr-2 h-4 w-4" />
                                </Link>
                            </MenubarTrigger>
                        </MenubarMenu>

                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${user?.role === "client" ? "border-orange-400" : "border-green-400"
                                            }`}
                                    >
                                        <UserIcon className={`h-4 w-4 ${user?.role === "client" ? "text-orange-500" : "text-green-500"}`} />
                                    </div>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-sm font-semibold text-zinc-900">{user?.fullname}</span>
                                        <Badge className={`text-white text-[10px] font-medium ${user?.role === "client" ? "bg-orange-500" : "bg-green-500"}`}>
                                            {user?.role}
                                        </Badge>
                                    </div>
                                </div>
                            </MenubarTrigger>
                            <MenubarContent align="end">
                                <MenubarGroup>
                                    <MenubarItem className="cursor-pointer">
                                        <Link href={isVendeur ? "/vendeur/dashboard" : "/client/profile"} className="flex items-center">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            {isVendeur ? "Mon dashboard" : "Mon compte"}
                                        </Link>
                                    </MenubarItem>
                                </MenubarGroup>
                                <MenubarSeparator />
                                <MenubarGroup>
                                    <MenubarItem className="cursor-pointer text-red-500">
                                        <Button variant="link" className="cursor-pointer" onClick={() => handleLogout()}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Deconnexion
                                        </Button>
                                    </MenubarItem>
                                </MenubarGroup>
                            </MenubarContent>
                        </MenubarMenu>
                    </Menubar>
                </div>

                {/* Mobile: Hamburger + Sheet */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <Menu className="h-5 w-5 text-zinc-700" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-70 p-0">
                        <SheetHeader className="p-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${user?.role === "client" ? "border-orange-400" : "border-green-400"
                                    }`}>
                                    <UserIcon className={`h-5 w-5 ${user?.role === "client" ? "text-orange-500" : "text-green-500"}`} />
                                </div>
                                <div>
                                    <SheetTitle className="text-sm font-bold text-zinc-900">{user?.fullname}</SheetTitle>
                                    <Badge className={`text-white font-medium text-[10px] ${user?.role === "client" ? "bg-orange-500" : "bg-green-500"}`}>
                                        {user?.role}
                                    </Badge>
                                </div>
                            </div>
                        </SheetHeader>

                        <Separator />

                        <nav className="flex flex-col p-3 gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === item.href
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <Separator className="mx-3" />

                        <nav className="flex flex-col p-3 gap-1">
                            <p className="px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                Mon espace
                            </p>
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === item.href
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto p-3">
                            <Separator className="mb-3" />
                            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full cursor-pointer">
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}

export default Header;
