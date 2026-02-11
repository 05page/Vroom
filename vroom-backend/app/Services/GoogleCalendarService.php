<?php

namespace App\Services;

use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class GoogleCalendarService
{
    private $client;
    private $calendar;
    private $user;

    /**
     * Vérifie si l'utilisateur possède les informations nécessaires 
     * pour une connexion à Google Calendar.
     */
    public static function isUserConnected(?User $user): bool
    {
        if (!$user) return false;
        
        $token = $user->google_access_token;
        return is_array($token) && isset($token['access_token']) && isset($token['refresh_token']);
    }

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->client = new Client();

        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect'));

        $token = $user->google_access_token;

        /**
         * Approche "Graceful failure" :
         * Si le jeton est manquant ou invalide, on ne lance pas d'exception
         * pour éviter de faire planter l'application entière, notamment 
         * si le service est instancié via l'injection de dépendances Laravel.
         */
        if (!is_array($token) || !isset($token['access_token'])) {
            return;
        }

        $this->client->setAccessToken($token);

        // Refresh automatique du jeton s'il est expiré
        if ($this->client->isAccessTokenExpired() && isset($token['refresh_token'])) {
            try {
                $newToken = $this->client->fetchAccessTokenWithRefreshToken($token['refresh_token']);

                if (!isset($newToken['error'])) {
                    $newToken['refresh_token'] = $token['refresh_token'];

                    $this->user->update([
                        'google_access_token' => $newToken,
                        'google_token_expires_at' => now()->addSeconds($newToken['expires_in']),
                    ]);

                    $this->client->setAccessToken($newToken);
                }
            } catch (\Exception $e) {
                Log::error('Erreur refresh token Google: ' . $e->getMessage());
            }
        }

        if ($this->client->getAccessToken()) {
            $this->calendar = new Calendar($this->client);
        }
    }

    public function deleteEvent(string $eventId): bool
    {
        if (!$this->calendar) {
            return false;
        }

        try {
            $this->calendar->events->delete('primary', $eventId);
            return true;
        } catch (\Exception $e) {
            Log::error('Erreur suppression Google API: ' . $e->getMessage());
            return false;
        }
    }

    public function createEvent(string $summary, string $description, \DateTime $start, \DateTime $end, string $attendeeEmail): ?string
    {
        try {
            $event = new Event([
                'summary' => $summary,
                'description' => $description,
                'start' => [
                    'dateTime' => $start->format(\DateTime::RFC3339),
                    'timeZone' => 'Africa/Abidjan',
                ],
                'end' => [
                    'dateTime' => $end->format(\DateTime::RFC3339),
                    'timeZone' => 'Africa/Abidjan',
                ],
                'attendees' => [['email' => $attendeeEmail]],
            ]);

            // 'primary' désigne le calendrier principal de l'utilisateur connecté
            $createdEvent = $this->calendar->events->insert('primary', $event);
            return $createdEvent->getId();
        } catch (\Google\Service\Exception $e) {
            // C'est ici qu'on capture l'erreur réelle (ex: 403, 400)
            Log::error('Erreur Google API: ' . $e->getMessage());
            return null;
        }
    }
}
