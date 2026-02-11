<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'fullname',
        'role',
        'partenaire_type',
        'email',
        'google_id',
        'facebook_id',
        'avatar',
        'telephone',
        'adresse',
        'password',
        'google_access_token',
        'google_refresh_token',
        'google_token_expires_at',
        'account_status',
        'active',
    ];

    const VENDEUR = "vendeur";
    const PARTENAIRE = "partenaire";
    const CLIENT = "client";
    const ADMIN = "admin";


    public function viewedVehicules()
    {
        return $this->belongsToMany(
            Vehicules::class,
            'vehicule_views',
            'user_id',
            'vehicule_id'
        );
    }

    //Ajouter les méthodes
    public function suspendre()
    {
        $this->account_status = 'suspendu';
        $this->save();
    }

    public function bannir()
    {
        $this->account_status = 'banni';
        $this->save();
    }

    public function restaurer()
    {
        $this->account_status = 'actif';
        $this->save();
    }

    public function isSuspendu(): bool
    {
        return $this->account_status === 'suspendu';
    }

    public function isBanni(): bool
    {
        return $this->account_status === 'banni';
    }

    public function isActif(): bool
    {
        return $this->account_status === 'actif';
    }

    //Relations pour les blocages
    public function usersBloque()
    {
        return $this->belongsToMany(
            User::class,
            'interactions',
            'user_id',
            'user_signale_id'
        )->wherePivot('type', Interactions::TYPE_BLOCAGE_USER);
    }

    public function bloquesPar()
    {
        return $this->belongsToMany(
            User::class,
            'interactions',
            'user_signale_id',
            'user_id'
        )->wherePivot('type', Interactions::TYPE_BLOCAGE_USER);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_access_token',
        'google_refresh_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // Cast Google token data to ensure it's always handled as an array/date
            'google_access_token' => 'array',
            'google_token_expires_at' => 'datetime',
        ];
    }
}
