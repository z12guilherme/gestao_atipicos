// supabase/functions/_shared/cors.ts

// Lista de origens permitidas. Adicione outras se necessário.
const allowedOrigins = [
  'https://gestao-atipicos.vercel.app', // Produção
  'http://localhost:5173',             // Desenvolvimento Vite (padrão)
  'http://localhost:8080',             // Desenvolvimento Docker
];

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(', '),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}
