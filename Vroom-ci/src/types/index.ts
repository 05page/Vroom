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
  | "client" | "admin" | "vendeur" | "concessionnaire" | "auto_ecole"

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
  rdv_recents: Transaction[];
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
  creator?: { id: string; fullname: string; email?: string; role?: string }; // vendeur du véhicule
  description: VehiculeDescription;
  photos?: VehiculePhotos[]; // photos du véhicule (relation Eloquent chargée avec 'photos')
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

export interface RendezVous {
  id: string
  client_id: string
  vendeur_id: string
  vehicule_id: string
  date_heure: string
  type: 'visite' | 'essai_routier' | 'premiere_rencontre'
  statut: 'en_attente' | 'confirmé' | 'refusé' | 'annulé' | 'terminé'
  motif?: string | null
  lieu?: string | null
  notes?: string | null
  client?: { id: string; fullname: string; avatar?: string | null; telephone?: string | null }
  vendeur?: { id: string; fullname: string; avatar?: string | null; telephone?: string | null }
  vehicule?: vehicule
  created_at: string
  updated_at: string
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
  id: string
  user_id: number
  vehicule_id: string
  date_ajout: string
  vehicule?: vehicule
}

// Alias conservé pour compatibilité, utiliser RendezVous directement
export type ClientRdvItem = RendezVous
export type RdvItem = RendezVous

export interface Alerte {
  id: string
  user_id: string
  marque_cible?: string | null
  modele_cible?: string | null
  prix_max?: number | null
  carburant?: string | null
  active: boolean
  created_at: string
}

export interface Avis {
  id: string
  client_id: string
  vendeur_id: string
  note: number // 1 à 5
  commentaire?: string | null
  date_avis: string
  client?: { id: string; fullname: string; avatar?: string | null }
}

export interface AvisVendeur {
  avis: Avis[]
  note_moyenne: number
  total: number
}