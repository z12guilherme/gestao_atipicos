# ✅ OWASP ASVS Checklist (Nível 1 - Web Essentials)

Este checklist baseia-se no **OWASP Application Security Verification Standard (ASVS) 4.0**, focado nos controles essenciais para a aplicação **Gestão Atípicos**.

---

## V2: Autenticação

| ID | Requisito | Status | Observação |
| :--- | :--- | :---: | :--- |
| **2.1.1** | Verificar se todas as senhas têm pelo menos 12 caracteres (ou política forte equivalente). | ✅ | Gerenciado pelo Supabase Auth. |
| **2.1.2** | Verificar se senhas fortes são permitidas (espaços, unicode, emojis, 64+ chars). | ✅ | Supabase suporta. |
| **2.1.7** | Verificar se as senhas não são armazenadas em texto claro (hashing). | ✅ | Supabase usa bcrypt/argon2. |
| **2.1.8** | Verificar se há proteção contra força bruta (rate limiting/bloqueio). | ✅ | Supabase possui rate limiting. |
| **2.2.1** | Verificar se a recuperação de senha é segura (não revela existência do usuário). | ✅ | Mensagens genéricas configuradas. |

---

## V3: Gerenciamento de Sessão

| ID | Requisito | Status | Observação |
| :--- | :--- | :---: | :--- |
| **3.1.1** | Verificar se tokens de sessão são invalidados no logout. | ✅ | `supabase.auth.signOut()` implementado. |
| **3.2.1** | Verificar se tokens são gerados com entropia forte. | ✅ | JWTs assinados pelo Supabase. |
| **3.4.1** | Verificar se cookies de sessão têm flags `Secure`, `HttpOnly` e `SameSite`. | ✅ | Gerenciado pelo SDK do Supabase/Browser. |

---

## V4: Controle de Acesso

| ID | Requisito | Status | Observação |
| :--- | :--- | :---: | :--- |
| **4.1.1** | Verificar se o princípio do menor privilégio é aplicado. | ✅ | RLS configurado para cada role. |
| **4.1.3** | Verificar se o controle de acesso falha de forma segura (deny by default). | ✅ | RLS nega acesso se não houver política. |
| **4.2.1** | Verificar se IDs de recursos (ex: `/students/123`) são validados contra o usuário logado. | ✅ | RLS impede acesso a IDs não vinculados (IDOR). |

---

## V5: Validação, Sanitização e Encoding

| ID | Requisito | Status | Observação |
| :--- | :--- | :---: | :--- |
| **5.1.1** | Verificar se toda entrada é validada no servidor (além do cliente). | ✅ | Constraints no Banco (NOT NULL, Types) e Zod no frontend. |
| **5.3.1** | Verificar se a saída é codificada para prevenir XSS. | ✅ | React faz escaping automático. |
| **5.5.1** | Verificar prevenção contra SQL Injection. | ✅ | Uso de Supabase Client (não concatena strings SQL). |

---

## V8: Proteção de Dados

| ID | Requisito | Status | Observação |
| :--- | :--- | :---: | :--- |
| **8.1.1** | Verificar se dados sensíveis (saúde) são protegidos em trânsito (TLS). | ✅ | HTTPS forçado. |
| **8.2.1** | Verificar se dados sensíveis são protegidos em repouso. | ⚠️ | Banco criptografado pelo provedor, mas dados de saúde em texto claro no DB (acesso restrito via RLS). |

---

## V14: Configuração

| ID | Requisito | Status | Observação |
| :--- | :--- | :---: | :--- |
| **14.2.1** | Verificar se componentes de terceiros (libs) estão atualizados. | ⚠️ | `npm audit` deve ser rodado regularmente. |
| **14.4.1** | Verificar se cabeçalhos de segurança HTTP estão configurados. | ✅ | Vercel/Cloudflare padrão. |

---

## Resumo da Avaliação

- **Total de Controles:** 16
- **Conformes (✅):** 14
- **Atenção (⚠️):** 2

**Próxima Revisão:** Março de 2026