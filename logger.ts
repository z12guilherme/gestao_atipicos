import pino from 'pino';

/**
 * Logger estruturado para o Frontend.
 * Garante que os logs sejam emitidos em formato JSON para fácil ingestão por SIEM (Datadog, Splunk, etc).
 * Remove automaticamente dados sensíveis (PII) definidos na lista de redaction.
 */
export const logger = pino({
  browser: {
    asObject: true, // Força o log a ser um objeto JSON, não uma string
    serialize: true,
  },
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // Configuração de Sanitização de Dados (LGPD/Security)
  redact: {
    paths: [
      'student.cpf',
      'student.diagnosis',
      'student.medical_info',
      'user.email',
      'user.cpf',
      'password',
      'token',
      'access_token',
      '*.password',
      '*.token'
    ],
    censor: '[DADO SENSÍVEL REMOVIDO]',
  },
  
  timestamp: pino.stdTimeFunctions.isoTime,
});