"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    BarChart3,
    Bell,
    Car,
    CreditCard,
    MessageSquare,
    Home,
    LayoutDashboard,
    LogOut,
    Settings,
    TrendingUp,
    User,
    Warehouse,
    Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

const navItems = [
    { href: "/partenaire/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/partenaire/mongarage", label: "Mon Garage", icon: Warehouse },
    { href: "/partenaire/stats", label: "Statistiques", icon: BarChart3 },
    { href: "/partenaire/trend", label: "Tendances", icon: TrendingUp },
    { href: "/partenaire/rdv", label: "Nos Rendez-vous", icon: Calendar },
    { href: "/partenaire/abonnements", label: "Abonnements", icon: CreditCard },
    { href: "/partenaire/settings", label: "Paramètres", icon: Settings },
]

export default function PartenaireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/partenaire/dashboard">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                                        <Car className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-bold">Vroom CI</span>
                                        <Badge className="bg-black text-[10px] w-fit">partenaire</Badge>
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
                                            isActive={pathname === item.href}
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

                    <SidebarGroup>
                        <SidebarGroupLabel>Accès rapide</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Accueil site">
                                        <Link href="/">
                                            <Home />
                                            <span>Accueil site</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="text-sm font-medium">Partenaire</span>
                                    <span className="text-xs text-muted-foreground">contact@partenaire.ci</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <LogOut />
                                <span>Déconnexion</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <span className="text-sm font-medium text-muted-foreground">
                        Dashboard
                    </span>
                    <div className="ml-auto flex items-center gap-4">
                        <Link href="/partenaire/messages" className="relative text-muted-foreground hover:text-foreground transition-colors">
                            <MessageSquare className="h-5 w-5" />
                        </Link>
                        <Link href="/partenaire/notifications" className="relative text-muted-foreground hover:text-foreground transition-colors">
                            <Bell className="h-5 w-5" />
                        </Link>
                        <span className="text-sm font-medium text-muted-foreground">
                            Espace Partenaire
                        </span>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
