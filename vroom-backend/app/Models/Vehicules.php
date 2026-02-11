<?php

namespace App\Models;

use App\Services\GeminiService;
use Illuminate\Database\Eloquent\Model;

class Vehicules extends Model
{
    //
    protected $table = 'vehicules';
    protected $fillable = [
        'created_by',
        'post_type',
        'type',
        'statut',
        'prix',
        'prix_suggere',
        'negociable',
        'date_publication',
        'status_validation',
        'views_count',
        'view_by'
    ];

    protected $casts = [
        'negociable' => 'boolean',
        'prix' => 'decimal:2',
        'prix_suggere' => 'decimal:2',
        'date_publication' => 'date',
    ];

    //Constantes pour les types de post
    const POST_TYPE_VENTE = 'vente';
    const POST_TYPE_LOCATION = 'location';

    //Constantes pour les types de véhicules
    const VEHICLE_TYPE_NEUF = 'neuf';
    const VEHICLE_TYPE_OCCASION = 'occasion';

    //Constantes pour les statuts
    const STATUS_DISPONIBLE = 'disponible';
    const STATUS_VENDU = 'vendu';
    const STATUS_LOUE = 'loué';
    const STATUS_SUSPENDU = 'suspendu';
    const STATUS_RESTAURER = 'restauree';
    const STATUS_BANNI = "banni";

    const STATUS_VALIDATED = 'validee';
    const STATUS_REJETEE = 'rejetee';
    const STATUS_PENDING = 'en_attente';

    //Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function description()
    {
        return $this->hasOne(VehiculesDescription::class, 'vehicule_id');
    }

    public function photos()
    {
        return $this->hasMany(VehiculesPhotos::class, 'vehicule_id');
    }

    public function moderations()
    {
        return $this->hasMany(Moderations::class, 'moderable_id');
    }

    public function views()
    {
        return $this->hasMany(VehiculeView::class, 'vehicule_id', 'id');
    }

    public function viewers()
    {
        return $this->belongsToMany(
            User::class,
            'vehicule_views',
            'vehicule_id', // clé étrangère vers vehicules
            'user_id'      // clé étrangère vers users
        );
    }
    //Scopes(les scopes permettent de réutiliser des requêtes courantes)
    public function scopeDisponible($query)
    { //$query est l'instance de la requête en cours
        return $query->where('statut', 'disponible');
    }

    public function scopeNeuf($query)
    {
        return $query->where('type', 'neuf');
    }

    public function scopeOccasion($query)
    {
        return $query->where('type', 'occasion');
    }

    public function scopeVendu($query)
    {
        return $query->where('statut', 'vendu');
    }

    public function scopeLoue($query)
    {
        return $query->where('statut', 'loué');
    }

    public function scopeValidee($query)
    {
        return $query->where('status_validation', 'validee');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('status_validation', 'en_attente');
    }

    public function scopeRejetee($query)
    {
        return $query->where('status_validation', 'rejetee');
    }

    public function isSuspendu(): bool
    {
        return $this->status_validation === self::STATUS_SUSPENDU;
    }

    public function scopeNonSignalesParUser($query, $userId)
    {
        return $query->whereNotIn('id', function ($subQuery) use ($userId) {
            $subQuery->select('post_id')
                ->from('interactions')
                ->where('user_id', $userId)
                ->where('type', 'alerte');
        });
    }

    public function scopeNonCreesParUsersBloque($query, $userId)
    {
        return $query->whereNotIn('created_by', function ($subQuery) use ($userId) {
            $subQuery->select('user_signale_id')
                ->from('interactions')
                ->where('user_id', $userId)
                ->where('type', Interactions::TYPE_BLOCAGE_USER);
        });
    }

    //Accessors et Mutators si nécessaire(un accessor permet de modifier la valeur d'un attribut lors de sa récupération, un mutator permet de modifier la valeur d'un attribut avant de l'enregistrer dans la base de données)

    //Mutators
    public function setPrixAttribute($value) //cette méthode est appelée automatiquement lorsque l'on assigne une valeur à l'attribut 'prix'
    {
        $this->attributes['prix'] = round($value, 2);
    }

    public function setPrixSuggereAttribute($value)
    {
        $this->attributes['prix_suggere'] = round($value, 2); //round arrondit la valeur à 2 décimales
    }

    //Accessors
    public function getPrixAttribute($value) //cette méthode est appelée automatiquement lorsque l'on récupère la valeur de l'attribut 'prix'
    {
        return number_format($value, 2, '.', ''); //number_format formate le nombre avec 2 décimales
    }
    public function getPrixSuggereAttribute($value)
    {
        return number_format($value, 2, '.', '');
    }

    //Fonctions personnalisées si nécessaire
    //fontion pour vérifier si le véhicule est négociable
    public function isNegociable()
    {
        return $this->negociable;
    }

    public function registerView(User $user): void
    {
        if ($this->created_by === $user->id) {
            return;
        }

        $alreadyViewed = $this->views()
            ->where('user_id', $user->id)
            ->exists();

        if (!$alreadyViewed) {
            $this->views()->create([
                'user_id' => $user->id,
            ]);

            $this->increment('views_count');
        }
    }

    public function suspendre()
    {
        $this->status_validation = self::STATUS_SUSPENDU;
        $this->save();
    }

    public function restaurer()
    {
        $this->status_validation = self::STATUS_RESTAURER;
        $this->save();
    }

    public function rejete()
    {
        $this->status_validation = self::STATUS_REJETEE;
        $this->save();
    }

    public function retirerSuspension()
    {
        $this->status_validation = self::STATUS_DISPONIBLE;
        $this->save();
    }

    public function getResume(): array
    {
        return [
            'id' => $this->id,
            'post_type' => $this->post_type,
            'type' => $this->type,
            'statut' => $this->statut,
            'prix' => $this->prix,
            'prix_suggere' => $this->prix_suggere,
            'negociable' => $this->negociable,
            'date_publication' => $this->date_publication ? $this->date_publication->toDateString() : null,
            'status_validation' => $this->status_validation,
        ];
    }
}
