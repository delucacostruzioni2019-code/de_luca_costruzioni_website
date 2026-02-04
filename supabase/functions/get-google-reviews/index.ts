import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

interface GoogleReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
}

interface GooglePlacesResponse {
  result: GooglePlaceDetails;
  status: string;
  error_message?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Configurazione API (inserisci qui le tue credenziali)
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
    const GOOGLE_PLACE_ID = Deno.env.get('GOOGLE_PLACE_ID')

    if (!GOOGLE_API_KEY || !GOOGLE_PLACE_ID) {
      throw new Error('Configurazione Google Places API mancante')
    }

    console.log('🔍 Recupero recensioni Google Places per Place ID:', GOOGLE_PLACE_ID)

    // Costruzione URL per Google Places API
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
    const params = new URLSearchParams({
      place_id: GOOGLE_PLACE_ID,
      fields: 'name,rating,user_ratings_total,reviews,formatted_address,formatted_phone_number,website',
      key: GOOGLE_API_KEY,
      language: 'it',
      region: 'IT',
      reviews_sort: 'newest'
    })

    const url = `${baseUrl}?${params.toString()}`

    // Chiamata a Google Places API
    console.log('📡 Chiamata a Google Places API...')
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: GooglePlacesResponse = await response.json()

    if (data.status !== 'OK') {
      console.error('❌ Errore Google Places API:', data.status, data.error_message)
      throw new Error(`Google Places API Error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    console.log('✅ Recensioni recuperate con successo')
    console.log(`📊 ${data.result.user_ratings_total} recensioni totali, media: ${data.result.rating}`)
    console.log(`📝 ${data.result.reviews?.length || 0} recensioni dettagliate recuperate`)

    return new Response(
      JSON.stringify({
        success: true,
        data: data.result,
        metadata: {
          timestamp: new Date().toISOString(),
          cache_duration_hours: 24
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('❌ Errore nel recupero delle recensioni:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback_data: {
          place_id: 'mock_place_id',
          name: 'De Luca Costruzioni',
          rating: 5.0,
          user_ratings_total: 38,
          reviews: [
            {
              author_name: 'Daniele Pingue',
              rating: 5,
              relative_time_description: '6 mesi fa',
              text: 'Professionalità e disponibilità sono gli aggettivi per definire al meglio questa esperienza. Eccellenti in tutto, soprattutto nel rispetto dei tempi previsti che non è mai semplice in fase di ristrutturazione.',
              time: Date.now() - (6 * 30 * 24 * 60 * 60 * 1000)
            },
            {
              author_name: 'Marco Rossi',
              rating: 5,
              relative_time_description: '3 mesi fa',
              text: 'Servizio impeccabile, personale competente e sempre disponibile. Hanno superato le mie aspettative in ogni aspetto del progetto.',
              time: Date.now() - (3 * 30 * 24 * 60 * 60 * 1000)
            },
            {
              author_name: 'Laura Bianchi',
              rating: 5,
              relative_time_description: '2 mesi fa',
              text: 'Esperienza fantastica! Consiglio vivamente questa azienda a chiunque cerchi professionalità e qualità nel servizio.',
              time: Date.now() - (2 * 30 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})