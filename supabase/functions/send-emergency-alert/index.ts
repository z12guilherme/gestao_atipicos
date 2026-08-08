import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Trata a requisição CORS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { studentName, message, severity, phoneNumbers } = await req.json()

    // Validação básica
    if (!studentName || !message || !phoneNumbers) {
      throw new Error("Parâmetros ausentes: studentName, message ou phoneNumbers.")
    }

    // AQUI ENTRARIA A INTEGRAÇÃO COM A API DO TWILIO OU Z-API (WhatsApp)
    // Exemplo genérico com Twilio:
    /*
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    for (const phone of phoneNumbers) {
      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: phone,
          Body: `EMERGÊNCIA (${severity}) - Gestão Atípicos\nAluno: ${studentName}\n\nMensagem: ${message}`
        })
      });
      // Lidar com resposta...
    }
    */

    // Simulação de envio com sucesso (para o MVP / TCC)
    console.log(`[SIMULAÇÃO] SMS enviado para ${phoneNumbers.join(', ')} sobre ${studentName}. Mensagem: ${message}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Alertas de emergência enviados com sucesso (Modo Simulado)." 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
