<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FindOrCreateConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicule_id'   => 'required|uuid|exists:vehicules,id',
            'other_user_id' => 'required|uuid|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'vehicule_id.required'   => 'Le véhicule est obligatoire.',
            'vehicule_id.exists'     => 'Ce véhicule n\'existe pas.',
            'other_user_id.required' => 'L\'interlocuteur est obligatoire.',
            'other_user_id.exists'   => 'Cet utilisateur n\'existe pas.',
        ];
    }
}
