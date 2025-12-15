# 📘 Playbook: Resposta a Incidentes (Honeytokens)

Este documento descreve os procedimentos operacionais padrão (SOP) para quando um **Honeytoken** ou **Canary Endpoint** for acionado na aplicação **Gestão Atípicos**.

---

## 1. 🚨 O Gatilho (Detecção)
O incidente começa quando os logs do **Supabase** ou **Vercel/Cloudflare** registram:
- Uso de uma chave de API marcada como isca.
- Acesso a uma rota inexistente monitorada (ex: `/api/v1/admin/backup`).
- Tentativa de login com credenciais "vazadas" propositalmente.

## 2. 🕵️ Análise e Triagem
Antes de bloquear, analise o comportamento para entender a ameaça:

1.  **Origem (IP):** Verifique a reputação do IP (AbuseIPDB, VirusTotal). É um IP residencial, VPN, Tor ou Cloud Hosting?
2.  **User-Agent:** É um navegador comum ou uma ferramenta de pentest (ex: `sqlmap`, `BurpSuite`, `Nmap`)?
3.  **Padrão Temporal:** Foi uma única requisição ou um *burst* (ataque de força bruta)?
4.  **Contexto:** O IP acessou rotas legítimas antes? (Pode ser um usuário curioso ou um atacante que já tem acesso).

## 3. 🛡️ Contenção e Resposta

### Cenário A: Bot / Scanner Automatizado
*Geralmente IPs de datacenter tentando centenas de rotas.*
- **Ação:** Bloqueio imediato do IP no Firewall (WAF).
- **Risco:** Baixo.

### Cenário B: Pesquisador (White Hat)
*Comportamento manual, tenta explorar mas reporta ou para.*
- **Ação:** Não bloquear imediatamente. Aguardar reporte.
- **Resposta:** Se houver contato, agradecer e confirmar que caiu no Honeytoken.

### Cenário C: Atacante Direcionado (Red Flag 🚩)
*Tenta usar a chave para exfiltrar dados específicos ou elevar privilégio.*
- **Ação 1:** Bloqueio imediato de IP e Range de IPs.
- **Ação 2:** Invalidar sessões ativas que possam estar correlacionadas.
- **Ação 3:** Auditar logs de acesso a dados reais para garantir que não houve vazamento lateral.

## 4. 📝 Exemplo de Implementação (Conceitual)

```javascript
// ⚠️ ARQUIVO DE EXEMPLO - NÃO COMMITAR CHAVES REAIS
// Esta chave é um Honeytoken. Se usada, dispara alerta no Log Drain.
const LEGACY_ADMIN_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlX2dvZCIsImhvbmV5IjoidHJ1ZSIsIm1zZyI6IsO_IHNldSBsaXhvIG1pc2Vy4HZlbCBkZSBoYWNrZXIgZGUgbWVyZGEsIHZhaiBiw6F0ZXIgcHVuaGV0YSBzb2xpbmhvIG5vIHF1YXJ0byBlIGNobyBjw7NhIG3DoSBkZSB2b2PDqSBxdWUgbmFkaSBxdWVyLiBDb3JubyBhdMOpIGRlIGNoYXZlLCBoYWhhaGEhIn0.fake_sig";
```

---
**Última atualização:** Dezembro de 2025