# Guia de Atualização do Documento do TCC

Este guia apresenta o texto original do seu TCC e o **novo texto** (ou texto adicional) que você deve usar para refletir todas as funcionalidades recentes, incluindo o PDI, Diário de Saúde, e a Autenticação em Duas Etapas (2FA).

---

## 1. Resumo (Página 5)

**Texto Atual (Substituir):**
> "(...) registro de observações diárias, agenda de cuidados e geração de relatórios, com perfis diferenciados (...) O sistema prioriza a segurança da informação por meio de Row Level Security (RLS), conformidade com a LGPD, testes de penetração e modelo de ameaças STRIDE."

**Novo Texto (Como deve ficar):**
> "(...) registro de observações diárias, agenda de cuidados, **gestão do Plano de Desenvolvimento Individual (PDI), controle rigoroso de medicações (Diário de Saúde)** e geração de relatórios, com perfis diferenciados (...) O sistema prioriza a segurança da informação por meio de Row Level Security (RLS), **Autenticação em Duas Etapas (2FA/MFA)**, conformidade com a LGPD, testes de penetração e modelo de ameaças STRIDE."

*(Nota: Lembre-se de fazer a mesma alteração no **Abstract** em inglês).*

---

## 2. Referencial Teórico (Capítulo 2)

**Ação:** Adicionar um novo subcapítulo no final do Capítulo 2.

**O que acrescentar (Novo Texto):**
> **2.7 Autenticação Multifator (MFA/2FA)**
> A Autenticação Multifator é um mecanismo de segurança que exige duas ou mais provas de identidade (fatores) antes de conceder acesso a um sistema. Segundo as diretrizes da OWASP, depender exclusivamente de senhas (fator de conhecimento) é insuficiente contra ataques modernos como *credential stuffing* ou *phishing*. A implementação do MFA, utilizando aplicativos geradores de códigos baseados em tempo (TOTP - Time-Based One-Time Password), como o Google Authenticator, adiciona um fator de posse (o dispositivo móvel do usuário), elevando drasticamente a resiliência do sistema contra acessos não autorizados, especialmente em plataformas que lidam com dados sensíveis de saúde e educação infantil.

---

## 3. Metodologia (Capítulo 3)

**Ação:** Adicionar um novo subcapítulo (3.7) após a seção 3.6 (Desenvolvimento Android APK), para detalhar as funcionalidades criadas.

**O que acrescentar (Novo Texto):**
> **3.7 Módulos Integrados do Sistema**
> Para abranger a jornada completa do estudante atípico e atender aos requisitos levantados, a plataforma foi estruturada em módulos altamente integrados:
> - **PDI e Evolução:** Painel analítico que gamifica o progresso do aluno (sistema de conquistas), mapeia metas semestrais e cruza gatilhos comportamentais, consolidando o anedotário multidisciplinar.
> - **Diário de Saúde:** Módulo focado no controle rigoroso da rotina fisiológica e administração de medicamentos, permitindo que a escola controle horários e dosagens de forma segura.
> - **Comunicação Segura:** Portal centralizado que substitui aplicativos de mensagens não oficiais, oferecendo chat criptografado, mural de recados com controle de ciência e gestão de reuniões virtuais.
> - **Autenticação Avançada (2FA):** Exigência de vínculo com aplicativos autenticadores (ex: Google Authenticator) durante o login, garantindo que mesmo em caso de vazamento de senhas, os laudos e dados médicos dos alunos permaneçam protegidos pelo segundo fator.

---

## 4. Escopo dos Testes de Penetração (Capítulo 4.1)

**Texto Atual (Adicionar ao final do parágrafo existente):**
> "(...) impedindo que um atacante deduza quais usuários estão cadastrados na base de dados."

**O que acrescentar (Novo Texto - colocar logo após a frase acima):**
> "Destaca-se a implementação mandatória da Autenticação em Duas Etapas (2FA) via TOTP. Durante os testes de segurança, simulou-se o comprometimento e vazamento da senha legítima de um usuário 'Gestor'. Mesmo possuindo a credencial correta de primeiro fator, o acesso do atacante foi integralmente neutralizado pela ausência do token dinâmico, comprovando a resiliência do sistema contra ataques de roubo e reaproveitamento de senhas."

---

## 5. Análise de Autenticação (Anexo B - Item 5.1)

**Texto Atual (Adicionar um novo bullet point nos Resultados Obtidos):**
> Resultados obtidos:
> - Não foi detectada enumeração de usuários.
> - Foram implementadas mensagens de erro genéricas.
> - A autenticação encontra-se protegida por chave pública válida (anon key).
> - Tokens inválidos foram rejeitados corretamente.

**O que acrescentar (Novo Texto):**
> - **Mitigação de Roubo de Credenciais:** O uso do 2FA bloqueou tentativas de acesso mesmo quando credenciais (login/senha) válidas foram utilizadas em um ambiente de ataque simulado.

---

## 6. Limitações e Trabalhos Futuros (Capítulo 6.1)

**Texto Atual (Substituir):**
> "Desenvolvimento de Aplicativo Móvel: Criação de uma versão nativa (Mobile) para facilitar o registro de ocorrências pelos cuidadores em tempo real, inclusive em modo offline.
> Integração com Inteligência Artificial: Uso de algoritmos para analisar padrões nos diários de bordo e gerar insights pedagógicos automáticos para os gestores."

**Motivo da mudança:** Nós já fizemos o App Móvel PWA/Capacitor e a Inteligência Artificial já foi simulada/integrada nos gatilhos do PDI!

**Novo Texto (Como deve ficar):**
> "Para a continuidade da pesquisa e evolução do software, sugerem-se as seguintes implementações futuras:
> - **Integração IoT e Wearables:** Sincronizar dados biométricos (como batimentos cardíacos e variabilidade da frequência cardíaca) captados por relógios inteligentes (smartwatches) diretamente com o Diário de Saúde, visando antecipar e prevenir crises sensoriais.
> - **Notificações Multicanal:** Expansão do módulo de comunicação para incluir o disparo automatizado de alertas críticos (como emergências médicas ou atrasos no check-in) via integrações com APIs de SMS e WhatsApp.
> - **Expansão da Auditoria:** Implementação completa de um sistema SIEM (Security Information and Event Management) dedicado, para monitoramento contínuo e alerta proativo de ameaças ao ambiente de produção."
