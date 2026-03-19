<?php

namespace Database\Seeders;

use App\Models\PlanAbonnement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanAbonnementSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            // ── Plans Vendeur particulier ──────────────────────────────
            [
                'id'                 => Str::uuid(),
                'nom'                => 'Vendeur Gratuit',
                'description'        => 'Démarrez gratuitement avec quelques annonces.',
                'cible'              => 'vendeur',
                'prix_mensuel'       => 0,
                'prix_annuel'        => 0,
                'nb_postes_max'      => 1,
                'nb_annonces_max'    => 3,
                'nb_photos_max'      => 3,
                'stats_avancees'     => false,
                'badge_premium'      => false,
                'boost_annonces'     => false,
                'acces_leads'        => false,
                'support_prioritaire'=> false,
            ],
            [
                'id'                 => Str::uuid(),
                'nom'                => 'Vendeur Standard',
                'description'        => 'Idéal pour les vendeurs réguliers.',
                'cible'              => 'vendeur',
                'prix_mensuel'       => 9900,
                'prix_annuel'        => 99000,
                'nb_postes_max'      => 1,
                'nb_annonces_max'    => 15,
                'nb_photos_max'      => 8,
                'stats_avancees'     => true,
                'badge_premium'      => false,
                'boost_annonces'     => false,
                'acces_leads'        => false,
                'support_prioritaire'=> false,
            ],
            [
                'id'                 => Str::uuid(),
                'nom'                => 'Vendeur Premium',
                'description'        => 'Annonces illimitées, badge et boost.',
                'cible'              => 'vendeur',
                'prix_mensuel'       => 24900,
                'prix_annuel'        => 249000,
                'nb_postes_max'      => 1,
                'nb_annonces_max'    => 999,
                'nb_photos_max'      => 20,
                'stats_avancees'     => true,
                'badge_premium'      => true,
                'boost_annonces'     => true,
                'acces_leads'        => true,
                'support_prioritaire'=> true,
            ],

            // ── Plans Concessionnaire ──────────────────────────────────
            [
                'id'                 => Str::uuid(),
                'nom'                => 'Concessionnaire Starter',
                'description'        => 'Premier pas pour votre concession.',
                'cible'              => 'concessionnaire',
                'prix_mensuel'       => 29900,
                'prix_annuel'        => 299000,
                'nb_postes_max'      => 3,
                'nb_annonces_max'    => 30,
                'nb_photos_max'      => 10,
                'stats_avancees'     => true,
                'badge_premium'      => false,
                'boost_annonces'     => false,
                'acces_leads'        => false,
                'support_prioritaire'=> false,
            ],
            [
                'id'                 => Str::uuid(),
                'nom'                => 'Concessionnaire Pro',
                'description'        => 'La solution complète pour votre concession.',
                'cible'              => 'concessionnaire',
                'prix_mensuel'       => 59900,
                'prix_annuel'        => 599000,
                'nb_postes_max'      => 10,
                'nb_annonces_max'    => 999,
                'nb_photos_max'      => 20,
                'stats_avancees'     => true,
                'badge_premium'      => true,
                'boost_annonces'     => true,
                'acces_leads'        => true,
                'support_prioritaire'=> true,
            ],

            // ── Plans Auto-école ───────────────────────────────────────
            [
                'id'                 => Str::uuid(),
                'nom'                => 'Auto-école Starter',
                'description'        => 'Gérez vos formations et votre visibilité.',
                'cible'              => 'auto_ecole',
                'prix_mensuel'       => 19900,
                'prix_annuel'        => 199000,
                'nb_postes_max'      => 2,
                'nb_annonces_max'    => 10,
                'nb_photos_max'      => 8,
                'stats_avancees'     => true,
                'badge_premium'      => false,
                'boost_annonces'     => false,
                'acces_leads'        => false,
                'support_prioritaire'=> false,
            ],
            [
                'id'                 => Str::uuid(),
                'nom'                => 'Auto-école Pro',
                'description'        => 'Visibilité maximale et gestion avancée.',
                'cible'              => 'auto_ecole',
                'prix_mensuel'       => 39900,
                'prix_annuel'        => 399000,
                'nb_postes_max'      => 5,
                'nb_annonces_max'    => 999,
                'nb_photos_max'      => 20,
                'stats_avancees'     => true,
                'badge_premium'      => true,
                'boost_annonces'     => true,
                'acces_leads'        => true,
                'support_prioritaire'=> true,
            ],
        ];

        foreach ($plans as $plan) {
            PlanAbonnement::firstOrCreate(['nom' => $plan['nom']], $plan);
        }
    }
}
