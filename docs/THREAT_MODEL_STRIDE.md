# 🛡️ Threat Model (Modelo de Ameaças) - Metodologia STRIDE

**Projeto:** Gestão Atípicos  
**Data:** Dezembro de 2025  
**Escopo:** Aplicação Web, API Supabase, Banco de Dados e Processos de Negócio.

Este documento analisa as potenciais ameaças à segurança da aplicação utilizando a metodologia **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).

---

## 1. 🎭 Spoofing (Falsificação de Identidade)
*Ameaça: Um atacante tenta se passar por outro usuário (ex: um Cuidador tentando se passar por um Gestor).*

| Componente | Ameaça Identificada | Mitigação Implementada | Status |
| :--- | :--- | :--- | :---: |
| **Autenticação** | Roubo de credenciais (senhas fracas). | Política de senhas fortes (Supabase Auth). | ✅ |
| **API** | Reutilização de JWT roubado (Session Hijacking). | Tokens com expiração curta (Access Token) e Refresh Token seguro. | ✅ |
| **Frontend** | Phishing ou Engenharia Social contra a escola. | Treinamento de conscientização (ver `POLITICA_SEGURANCA_ESCOLA.md`). | ⚠️ |

---

## 2. 🛠️ Tampering (Violação de Dados)
*Ameaça: Modificação não autorizada de dados (ex: alterar o diagnóstico de um aluno ou registros de observações).*

| Componente | Ameaça Identificada | Mitigação Implementada | Status |
| :--- | :--- | :--- | :---: |
| **Banco de Dados** | Alteração direta via SQL Injection. | Uso de ORM/Query Builder e Prepared Statements do Supabase. | ✅ |
| **Trânsito** | Interceptação e modificação de requisições (MitM). | HTTPS forçado (HSTS) via Vercel/Cloudflare. | ✅ |
| **Lógica** | Usuário edita dados de outro usuário via API. | **Row Level Security (RLS)** rigoroso no PostgreSQL. | ✅ |

---

## 3. 🚫 Repudiation (Repúdio)
*Ameaça: Um usuário realiza uma ação (ex: deletar um aluno) e nega tê-lo feito, sem que haja prova do contrário.*

| Componente | Ameaça Identificada | Mitigação Implementada | Status |
| :--- | :--- | :--- | :---: |
| **Logs** | Falta de rastreabilidade de ações críticas. | Logs de acesso do Supabase. | ⚠️ |
| **Auditoria** | Exclusão de registros sem histórico. | Implementar *Soft Delete* (campo `deleted_at`) ao invés de delete físico. | 📝 |

---

## 4. 📢 Information Disclosure (Divulgação de Informação)
*Ameaça: Vazamento de dados sensíveis (ex: lista de alunos, dados médicos, endereços).*

| Componente | Ameaça Identificada | Mitigação Implementada | Status |
| :--- | :--- | :--- | :---: |
| **API** | Endpoint listando todos os usuários sem filtro. | RLS garante que `Responsável` vê apenas seus filhos. | ✅ |
| **Frontend** | Dados sensíveis cacheados em computadores públicos. | Cabeçalhos de Cache-Control apropriados; Logout limpa LocalStorage. | ✅ |
| **GitHub** | Vazamento de chaves de API (`service_role`). | Uso de variáveis de ambiente (`.env`); Honeytokens para detecção. | ✅ |
| **Erro** | Mensagens de erro detalhadas expondo stack trace. | Tratamento de erros no frontend (mensagens genéricas). | ✅ |

---

## 5. 🛑 Denial of Service (Negação de Serviço)
*Ameaça: Tornar o sistema indisponível para usuários legítimos.*

| Componente | Ameaça Identificada | Mitigação Implementada | Status |
| :--- | :--- | :--- | :---: |
| **API** | Múltiplas requisições pesadas (Brute Force/Flood). | Rate Limiting nativo do Supabase e proteção DDoS da Vercel. | ✅ |
| **Storage** | Upload de arquivos gigantes para esgotar cota. | Limite de tamanho de arquivo no Bucket do Supabase. | 📝 |

---

## 6. 👑 Elevation of Privilege (Elevação de Privilégio)
*Ameaça: Um usuário com permissões limitadas ganha acesso administrativo.*

| Componente | Ameaça Identificada | Mitigação Implementada | Status |
| :--- | :--- | :--- | :---: |
| **Lógica** | Manipulação do campo `role` no cadastro/edição. | Apenas `Gestores` podem definir/alterar roles (validado no Backend/RLS). | ✅ |
| **Supabase** | Uso da `anon_key` para bypass de RLS. | A `anon_key` respeita RLS por padrão. | ✅ |

---

## 📝 Plano de Ação (Prioridades)

1.  **Auditoria (Repudiation):** Implementar tabela de logs de auditoria (`audit_logs`) para ações sensíveis (criação/exclusão de usuários e alunos).
2.  **Storage (DoS):** Configurar regras de tamanho máximo e tipos de arquivo permitidos (apenas imagens/docs) no Supabase Storage.
3.  **Treinamento (Spoofing):** Divulgar a `POLITICA_SEGURANCA_ESCOLA.md` para os usuários.
4.  **Dependências (Supply Chain):** Substituir a biblioteca `xlsx` (vulnerável) por `exceljs` ou `read-excel-file` para mitigar CVEs conhecidas.

---
**Legenda:**
✅ = Implementado / Mitigado
⚠️ = Parcialmente Mitigado / Risco Aceito
📝 = Planejado / A Fazer