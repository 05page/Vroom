<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SupabaseStorageService
{
    private string $baseUrl;
    private string $serviceKey;
    private string $bucket;

    public function __construct()
    {
        $projectUrl = config('services.supabase.url');
        $this->baseUrl   = "{$projectUrl}/storage/v1/object";
        $this->serviceKey = config('services.supabase.service_key');
        $this->bucket    = config('services.supabase.bucket');
    }

    /**
     * Upload un fichier vers Supabase Storage et retourne l'URL publique.
     */
    public function upload(UploadedFile $file, string $folder = 'vehicules_photos'): string
    {
        // Génère un nom de fichier unique
        $filename  = Str::random(40) . '.' . $file->getClientOriginalExtension();
        $path      = "{$folder}/{$filename}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->serviceKey}",
            'Content-Type'  => $file->getMimeType(),
        ])->withBody(
            file_get_contents($file->getRealPath()),
            $file->getMimeType()
        )->post("{$this->baseUrl}/{$this->bucket}/{$path}");

        if (!$response->successful()) {
            throw new \RuntimeException("Supabase upload failed: " . $response->body());
        }

        // Retourne l'URL publique du fichier
        return "{$this->baseUrl}/public/{$this->bucket}/{$path}";
    }
}
