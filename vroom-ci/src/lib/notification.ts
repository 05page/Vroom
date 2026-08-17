import {
    Archive,
    Calendar,
    Car,
    GraduationCap,
    Handshake,
    KeyRound,
    LifeBuoy,
    ShieldAlert,
    TrendingUp,
    type LucideIcon,
} from "lucide-react";

import { TypeNotification } from "@/types";

/** Icône par type. Exhaustif sur les NEUF valeurs en base, `abonnement` hérité compris (types/index.ts:545). */
export const ICONE_TYPE_NOTIF: Record<TypeNotification, LucideIcon> = {
    rdv: Calendar,
    reservation: KeyRound,
    transaction: Handshake,
    alerte_vehicule: Car,
    formation: GraduationCap,
    moderation: ShieldAlert,
    support: LifeBuoy,
    tendance: TrendingUp,
    abonnement: Archive,
};
