const fs = require('fs');
const path = require('path');

// Sovrascriviamo il file base che Angular usa di default
const targetPath = path.join(__dirname, './src/environments/environment.ts');

const envConfigFile = `export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL || ''}',
  supabaseAnonKey: '${process.env.SUPABASE_ANON_KEY || ''}',
  supabaseServiceRoleKey: ''.
  googlePlaces: {
        apiKey: '', // Configurare con la API key di produzione
        placeId: '', // Configurare con il Place ID dell'attività
        language: 'it',
        region: 'IT'
    }
};
`;

try {
    fs.writeFileSync(targetPath, envConfigFile);
    console.log('✅ environment.ts sovrascritto con le variabili di Vercel');
} catch (err) {
    console.error('❌ Errore:', err);
    process.exit(1);
}