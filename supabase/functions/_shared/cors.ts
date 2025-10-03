// supabase/functions/_shared/cors.ts

const allowedOrigins = [
  'https://gestao-atipicos.vercel.app', // Produção
  'http://localhost:5173',             // Desenvolvimento Vite (padrão)
  'http://localhost:8080',             // Desenvolvimento Docker
];

const baseCorsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Gera os cabeçalhos de CORS dinamicamente com base na origem da requisição.
 * @param request A requisição recebida pela Edge Function.
 * @returns Um objeto com os cabeçalhos de CORS apropriados.
 */
export function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin");
  const headers = { ...baseCorsHeaders, 'Content-Type': 'application/json' };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}
