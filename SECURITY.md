# 🔐 Security Policy

## 📌 Projeto
**Gestão Atípicos**  
Plataforma web hospedada em Vercel, utilizando Supabase como backend (Auth, REST e Database).

---

## 🛡️ Compromisso com a Segurança

A segurança da aplicação **Gestão Atípicos** é tratada como prioridade.  
Este documento descreve:

- Os testes de segurança realizados
- Os controles existentes
- As vulnerabilidades **não encontradas**
- O processo de reporte responsável

---

## 📚 Documentação de Segurança Relacionada

Para detalhes mais técnicos e políticas específicas, consulte:

- [Modelo de Ameaças (STRIDE)](./THREAT_MODEL_STRIDE.md)
- [Checklist OWASP ASVS](./OWASP_ASVS_CHECKLIST.md)
- [Playbook de Resposta a Incidentes (Honeytokens)](./HONEYTOKEN_PLAYBOOK.md)
- [Política de Segurança para Escolas](./POLITICA_SEGURANCA_ESCOLA.md)
- [Conformidade LGPD](./LGPD_COMPLIANCE.md)

---

## 🔍 Escopo do Pentest

Os testes foram realizados **exclusivamente no ambiente do próprio projeto**, sem impacto a terceiros.

### Componentes avaliados:
- Frontend (Vercel)
- API pública
- Autenticação (Supabase Auth)
- REST API (Supabase)
- Headers HTTP
- Controle de acesso
- Validação de entradas
- Proteções contra ataques comuns (OWASP Top 10)

---

## 🧪 Testes Realizados

### 🔐 Autenticação & Autorização

- Tentativas de login com:
  - Usuários inexistentes
  - Senhas incorretas
  - Emails válidos e inválidos
- Testes de enumeração de usuários
- Testes de recuperação de senha (`/recover`)
- Tentativas de uso direto da API de autenticação

**Resultado:**  
✔️ Nenhuma enumeração de usuários detectada  
✔️ Mensagens genéricas de erro  
✔️ Autenticação protegida por chave válida (`anon key`)  
✔️ Tokens inválidos rejeitados

---

### 🔑 Exposição de Chaves (Supabase)

- Identificada a presença da `anon key` no frontend

**Análise de Segurança:**

- A `anon key` é **pública por design**
- Não concede acesso privilegiado
- Depende estritamente de **Row Level Security (RLS)**

**Resultado:**  
✔️ Nenhum acesso não autorizado  
✔️ RLS impede leitura/escrita indevida  
✔️ Tentativas retornaram `401 Unauthorized`

📌 **Conclusão:** Não configura vulnerabilidade.

---

### 🧠 JWT & Tokens

- Testes com:
  - JWT incompleto
  - JWT reaproveitado
  - JWT sem assinatura válida
  - Headers `Authorization` forjados

**Resultado:**  
✔️ Tokens inválidos rejeitados  
✔️ Nenhuma escalada de privilégio possível

---

### 🌐 API REST (Supabase)

- Tentativas de acesso direto ao endpoint `/rest/v1/`
- Uso de `apikey` inválida
- Uso de JWT inválido
- Acesso sem autenticação

**Resultado:**  
✔️ Acesso negado (`401 Unauthorized`)  
✔️ Nenhuma tabela exposta publicamente

---

### 💥 XSS (Cross‑Site Scripting)

Testes realizados com payloads como:
```html
<script>alert(1)</script>
<svg/onload=alert(1)>
"><svg/onload=alert(1)>
```

**Locais testados:**
- Query string
- Rotas públicas
- Body JSON (POST)

**Resultado:**
✔️ Nenhum payload executado
✔️ Nenhuma reflexão de input
✔️ Rotas inexistentes retornam 404

---

### 🧱 Headers de Segurança

**Headers observados:**
- Strict-Transport-Security
- X-Content-Type-Options: nosniff
- HTTPS forçado
- Cloudflare + Vercel

**Resultado:**
✔️ Proteções modernas ativas
✔️ Comunicação segura (TLS)

---

### 🚦 Rate Limiting / DDoS

**Infraestrutura baseada em:**
- Vercel
- Cloudflare
- Supabase

**Resultado:**
✔️ Proteção gerenciada por infraestrutura
✔️ Nenhum endpoint crítico exposto

---

## ❌ Vulnerabilidades NÃO Encontradas

- ❌ SQL Injection
- ❌ XSS (Refletido / Armazenado)
- ❌ CSRF
- ❌ Quebra de autenticação
- ❌ Enumeração de usuários
- ❌ Exposição de dados sensíveis
- ❌ Escalada de privilégios
- ❌ Acesso indevido via API
- ❌ Vazamento de tokens válidos

---

## 🚨 Defesa Ativa & Monitoramento

Como parte de nossa estratégia de segurança em profundidade, este projeto utiliza técnicas de **Active Defense**:

- **Honeytokens:** Credenciais falsas (ex: chaves de API, JWTs) inseridas intencionalmente em locais estratégicos para detectar vazamentos ou varreduras não autorizadas.
- **Canary Endpoints:** Rotas de API monitoradas que simulam endpoints administrativos ou sensíveis, mas servem apenas para alertar sobre tentativas de enumeração.
- **SIEM Dedicado:** Infraestrutura de monitoramento e correlação de eventos de segurança em tempo real. [Repositório do SIEM](https://github.com/z12guilherme/gestao_atipicos-siem).

⚠️ **Aviso aos Pesquisadores:**
Se você encontrar uma credencial que aparenta ter privilégios elevados (como `service_role`), considere a possibilidade de ser um artefato de defesa. O uso dessas credenciais é monitorado e gera alertas de segurança imediatos.

---

## ✅ Conclusão

Com base nos testes realizados:

1. A aplicação **Gestão Atípicos** apresenta um bom nível de maturidade em segurança e não demonstrou vulnerabilidades exploráveis durante os testes realizados.
2. A arquitetura adotada (Vercel + Supabase com RLS) está alinhada com boas práticas modernas de segurança.

---

## 📣 Reporte Responsável

Caso você identifique qualquer falha de segurança:

1. Abra uma issue privada (se disponível)
2. Ou entre em contato diretamente com o mantenedor

⚠️ **Não explore, não divulgue publicamente e não cause impacto em dados reais.**

---

## 📅 Histórico de Auditorias

| Data | Tipo de Teste | Escopo | Resultado |
| :--- | :--- | :--- | :--- |
| **15/12/2025** | **Pentest Blackbox** | Full Stack (Auth, RLS, API) | ✅ **0 Vulnerabilidades Críticas** |

**Última revisão:** 15 de Dezembro de 2025
**Status:** ✅ Aplicação aprovada nos testes realizados