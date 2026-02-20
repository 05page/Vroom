export interface User {
  id: number;
  fullname: string;
  role: string;
  partenaire_type: string;
  email: string;
  telephone: string;
  adresse: string;
  email_verified_at: string;
  account_status: string;
  data: string;
}

export type UserRole =
  | "client" | "admin" | "vendeur" | "partenaire"

export type PartenaireType =
  | "concessionnaire" | "auto_ecole"

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}

export interface VendeurStats {
  stats: VendeurStatsGlobal;
  top_vehicule_vues: TopVehiculesVues;
  vehicule: vehicule
  rdv: VendeurRdv;
}

export interface VendeurStatsGlobal {
  total_vehicule: number;
  total_vehicule_vendu: number;
  total_vehicule_loue: number;
  total_vehicule_vente: number;
  total_vehicule_location: number;
  total_vues: number;
  total_vues_mois: number;
  total_revenus: string;
}

export interface TopVehicle {
  id: number;
  post_type: string;
  statut: string;
  prix: string | number;
  views_count: number;
  description: VehiculeDescription;
}

export interface MesVehicules {
  vehicules: vehicule[]
}

export interface TopVehiculesVues {
  my_top_vehicle_most_vues: TopVehicle[];
  my_recent_vehicle: TopVehicle[];
}

export interface VendeurRdv {
  transactions_recentes: Transaction[];
  total_rdv: number;
}

export interface Transaction {
  id: number;
  post_type: string;
  type_finalisation: string;
  vehicule: {
    id: number;
    description?: any;
    photos?: any[];
  };
  client: {
    id: number;
    fullname: string;
    email: string;
    telephone: string;
    adresse: string;
  };
  proprietaire: {
    id: number;
    fullname: string;
    email: string;
    telephone: string;
    adresse: string;
  };
}

export interface vehicule {
  id: string;
  post_type: "vente" | "location"
  type: string;
  statut: string;
  prix: number;
  negociable: boolean;
  date_disponibilite: Date;
  status_validation: string;
  views_count: string;
  view_by: string;
  description: VehiculeDescription;
}

export interface VehiculeStats{
  total_vehicules: number
  en_vente: number
  en_location: number
}

export interface VehiculeDescription {
  vehicule_id: string;
  marque: string;
  modele: string;
  annee: number;
  carburant: string;
  transmission: string;
  kilometrage: string;
  couleur: string;
  nombre_portes: number;
  nombre_places: number;
  visite_technique: boolean;
  date_visite_technique: Date;
  carte_grise: boolean;
  date_carte_grise: boolean;
  assurance: boolean;
  historique_accidents: boolean;
  equipements: string[];
  photos: VehiculePhotos[]
}

export interface VehiculePhotos {
  vehicule_id: string;
  path: string;
  is_primary: boolean
  postion: number
}

export interface AllVehicules {
  vehicules: vehicule[]
  statsVehicules: VehiculeStats
}

export interface Rdv {
  list_rdv: RdvItem[]
  stats: RdvStats
}

export interface RdvStats {
  total_rdv: number
  rdv_coming: number
  rdv_annule: number
  rdv_effectue: number
}

export interface RdvItem {
  id: number
  user_id: number
  proprietaire_id: number
  vehicule_id: number
  date_rdv: string
  heure_rdv: string
  statut: string
  type_finalisation: string
  client: {
    id: number
    fullname: string
    email: string
    telephone: string
    adresse: string
  }
  vehicule: {
    id: number
    description: {
      marque: string
      modele: string
    }
  }
}

export interface MesNotifs {
  notifications: Notifications[]
}
export interface Notifications{
  id: number
  recever_id:number
  type: string
  title: string
  message: string
  is_read: boolean
  unread_count: number
  read_at: Date
  created_at: Date
}

export interface Favori {
  id: number
  user_id: number
  post_id: number
  type: string
  created_at: string
  post: vehicule
}

export interface ClientRdvItem {
  id: number
  user_id: number
  proprietaire_id: number
  vehicule_id: number
  date_rdv: string
  heure_rdv: string
  statut: string
  type_finalisation: string
  post_type: string
  vehicule: {
    id: number
    description?: VehiculeDescription
    photos?: VehiculePhotos[]
  }
  proprietaire: {
    id: number
    fullname: string
    email: string
    telephone: string
    adresse: string
  }
}