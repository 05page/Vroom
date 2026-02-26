"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
    Bell,
    Car,
    CheckCheck,
    LayoutDashboard,
    LogOut,
    ScrollText,
    Settings,
    Shield,
    ShieldAlert,
    UserCog,
    Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/src/context/UserContext"
import { useNotification } from "@/src/context/NotificationContext"
import { api } from "@/src/lib/api"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const navItems = [
    { href: "/admin/dashboard",    label: "Vue d'ensemble",       icon: LayoutDashboard },
    { href: "/admin/users",        label: "Utilisateurs",         icon: Users },
    { href: "/admin/admins",       label: "Administrateurs",      icon: UserCog },
    { href: "/admin/vehicules",    label: "Modération véhicules", icon: Car },
    { href: "/admin/signalements", label: "Signalements",         icon: ShieldAlert },
    { href: "/admin/logs",         label: "Journal",              icon: ScrollText },
    { href: "/admin/settings",     label: "Paramètres",           icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user } = useUser()
    const router = useRouter()
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotification()

    const handleLogout = async () => {
        await api.logout()
        router.push("/auth")
    }

    return (
        // Pas de classe .dark : on utilise le même thème clair que le reste de l'app
        <div className="min-h-screen bg-background text-foreground">
            <SidebarProvider>
                <Sidebar collapsible="icon">
                    <SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <Link href="/admin/dashboard">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                            <Shield className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 leading-none">
                                            <span className="font-bold">Vroom CI</span>
                                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] w-fit">
                                                admin
                                            </Badge>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navItems.map((item) => (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                                                tooltip={item.label}
                                            >
                                                <Link href={item.href}>
                                                    <item.icon />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/50">
                                        <Shield className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="text-sm font-medium">{user?.fullname ?? "Admin"}</span>
                                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleLogout}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut />
                                    <span>Déconnexion</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>

                    <SidebarRail />
                </Sidebar>

                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Espace Administration
                        </span>

                        {/* Cloche de notifications — tout à droite */}
                        <div className="ml-auto">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative h-9 w-9">
                                        <Bell className="h-5 w-5 text-muted-foreground" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>

                                <SheetContent className="w-[380px] sm:w-[420px] flex flex-col p-0">
                                    <SheetHeader className="px-4 pt-4 pb-3 border-b">
                                        <div className="flex items-center justify-between">
                                            <SheetTitle className="flex items-center gap-2 text-base">
                                                <Bell className="h-4 w-4 text-primary" />
                                                Notifications
                                                {unreadCount > 0 && (
                                                    <Badge className="bg-primary/15 text-primary border-primary/25 text-xs">
                                                        {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                                                    </Badge>
                                                )}
                                            </SheetTitle>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
                                                    onClick={markAllRead}
                                                >
                                                    <CheckCheck className="h-3.5 w-3.5" />
                                                    Tout lire
                                                </Button>
                                            )}
                                        </div>
                                    </SheetHeader>

                                    {/* Liste des notifications */}
                                    <div className="flex-1 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                                <Bell className="h-8 w-8 mb-2 opacity-30" />
                                                <p className="text-sm">Aucune notification</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {notifications.map((notif) => (
                                                    <button
                                                        key={notif.id}
                                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                                        className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors ${
                                                            !notif.is_read ? "bg-primary/5" : ""
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* Indicateur non-lu */}
                                                            <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                                                                !notif.is_read ? "bg-primary" : "bg-transparent"
                                                            }`} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm leading-snug ${!notif.is_read ? "font-semibold" : "font-normal"}`}>
                                                                    {notif.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                                    {notif.message}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                                                    {formatDistanceToNow(new Date(notif.created_at), {
                                                                        addSuffix: true,
                                                                        locale: fr,
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto p-4 md:p-6">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
