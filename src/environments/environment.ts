export const environment = {
  production: true,
      supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceRoleKey: '',
    resendApiKey: '', // Rimossa per sicurezza - ora gestita server-side
    
    // Google Places API Configuration
    googlePlaces: {
        apiKey: '', // Configurare con la API key di produzione
        placeId: '', // Configurare con il Place ID dell'attività
        language: 'it',
        region: 'IT'
    }
};