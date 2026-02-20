<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transactions extends Model
{
    //Model qui gere les transactions entre utilisateurs et proprietaires de vehicules
    protected $table = 'transactions';
    protected $fillable = [
        'user_id',
        'proprietaire_id',
        'vehicule_id',
        'numero_cni',
        'numero_permis',
        'date_rdv',
        'heure_rdv',
        'google_event_id',
        'statut',
        'type_finalisation',
        'confirme_par_client',
        'confirme_par_vendeur',
        'date_debut_location',
        'date_retour_prevue',
        'date_retour_effective',
        'prix_location_jour',
        'caution',
        'note_client',
        'rating_client',
        'note_proprietaire',
        'rating_proprietaire',
        'confirme_at',
        'effectue_at',
        'retourne_at',
        'annule_at',
    ];

    protected $casts = [
        'date_rdv' => 'date',
        'date_debut_location' => 'date',
        'date_retour_prevue' => 'date',
        'date_retour_effective' => 'date',
        'confirme_par_client' => 'boolean',
        'confirme_par_vendeur' => 'boolean',
        'prix_location_jour' => 'decimal:2',
        'caution' => 'decimal:2',
        'prix_final' => 'decimal:2',
    ];
    const STATUT_EN_ATTENTE = 'en_attente';
    const STATUT_CONFIRME = 'confirme';
    const STATUT_EN_COURS = 'en_cours';
    const STATUT_EFFECTUE = 'effectue';
    const STATUT_RETOURNE = 'retourne';
    const STATUT_ANNULE = 'annule';

    const TYPE_VENTE = 'vente';
    const TYPE_LOCATION = 'location';
    //Relations
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function proprietaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proprietaire_id');
    }

    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicules::class, 'vehicule_id');
    }

    //Scopes pour filtrer les transactions par statut
    public function scopeEnAttente($query)
    {
        return $query->where('statut', self::STATUT_EN_ATTENTE);
    }

    public function scopeConfirme($query)
    {
        return $query->where('statut', self::STATUT_CONFIRME);
    }

    public function scopeEncours($query)
    {
        return $query->where('statut', self::STATUT_EN_COURS);
    }

    public function scopeEffectue($query)
    {
        return $query->where('statut', self::STATUT_EFFECTUE);
    }

    public function scopeRetourne($query)
    {
        return $query->where('statut', self::STATUT_RETOURNE);
    }

    public function scopeAnnule($query)
    {
        return $query->where('statut', self::STATUT_ANNULE);
    }

    public function scopeByUser($query, $userId) //
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByProprietaire($query, $proprietaireId)
    {
        return $query->where('proprietaire_id', $proprietaireId);
    }

    public function scopeVentes($query)
    {
        return $query->where('type_finalisation', self::TYPE_VENTE);
    }

    public function scopeLocations($query)
    {
        return $query->where('type_finalisation', self::TYPE_LOCATION);
    }

    //fonctions pour changer le statut

    public function marquerEnCours()
    {
        $this->statut = self::STATUT_EN_COURS;
        $this->save();
    }

    public function confirmerParClient()
    {
        $this->statut = self::STATUT_CONFIRME;
        $this->save();
        $this->verifierDoubleConfirmation();
    }
    public function confirmerParVendeur()
    {
        $this->confirme_par_vendeur = true;
        $this->save();

        $this->verifierDoubleConfirmation();
    }

    private function verifierDoubleConfirmation()
    {
        if ($this->confirme_par_client && $this->confirme_par_vendeur) {
            $this->statut = self::STATUT_EFFECTUE;
            $this->effectue_at = now();
            $this->save();

            // Mettre à jour le véhicule
            $vehicule = $this->vehicule;
            if ($this->type_finalisation === self::TYPE_VENTE) {
                $vehicule->statut = Vehicules::STATUS_VENDU;
            } elseif ($this->type_finalisation === self::TYPE_LOCATION) {
                $vehicule->statut = Vehicules::STATUS_LOUE;
            }
            $vehicule->save();
        }
    }

    public function marquerRetourne()
    {
        if ($this->type_finalisation !== self::TYPE_LOCATION) {
            throw new \LogicException('Seules les locations peuvent être retournées');
        }

        $this->statut = self::STATUT_RETOURNE;
        $this->date_retour_effective = now();
        $this->retourne_at = now();
        $this->save();

        // Remettre le véhicule disponible
        $vehicule = $this->vehicule;
        $vehicule->statut = Vehicules::STATUS_DISPONIBLE;
        $vehicule->save();
    }
    public function annuler()
    {
        $this->statut = self::STATUT_ANNULE;
        $this->annule_at = now();
        $this->save();
    }
    public function isVente(): bool
    {
        return $this->type_finalisation === self::TYPE_VENTE;
    }

    public function isLocation(): bool
    {
        return $this->type_finalisation === self::TYPE_LOCATION;
    }

    public function isDoubleConfirme(): bool
    {
        return $this->confirme_par_client && $this->confirme_par_vendeur;
    }
    //Autres fonctions utiles

    public function getTransaction()
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'proprietaire_id' => $this->proprietaire_id,
            'vehicule_id' => $this->vehicule_id,
            'numero_cni' => $this->numero_cni,
            'numero_permis' => $this->numero_permis,
            'date_rdv' => $this->date_rdv,
            'heure_rdv' => $this->heure_rdv,
            'statut' => $this->statut,
            'note_client' => $this->note_client,
            'note_proprietaire' => $this->note_proprietaire,
            'confirme_at' => $this->confirme_at,
            'annule_at' => $this->annule_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
