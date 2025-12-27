# 📄 Documentação do Projeto: Gestão Atípicos

**Autor:** Marcos Guilherme  
**Email:** mguimarcos39@gmail.com  
**Data:** Dezembro de 2025

---

## Resumo

O projeto "Gestão Atípicos" consiste no desenvolvimento de uma plataforma web robusta e segura, destinada a otimizar o gerenciamento e acompanhamento de estudantes com necessidades atípicas em ambientes educacionais. A solução centraliza informações cruciais, conectando gestores, cuidadores e responsáveis em um ecossistema colaborativo. Através de painéis de controle personalizados para cada perfil de usuário, a plataforma visa garantir a privacidade dos dados, agilizar processos administrativos — como cadastros e atribuições — e, futuramente, aprimorar a comunicação sobre o desenvolvimento diário dos estudantes. A arquitetura moderna, baseada em tecnologias como React, TypeScript e Supabase, garante escalabilidade, segurança e uma experiência de usuário fluida e responsiva.

---

## Sumário

1.  [Introdução](#1-introdução)
    1.1. [Contextualização e Problema](#11-contextualização-e-problema)
    1.2. [Justificativa](#12-justificativa)
    1.3. [Objetivos](#13-objetivos)
2.  [Fundamentação Teórica e Tecnologias](#2-fundamentação-teórica-e-tecnologias)
    2.1. [Frontend](#21-frontend)
    2.2. [Backend e Banco de Dados](#22-backend-e-banco-de-dados)
    2.3. [UI e Ferramentas de Desenvolvimento](#23-ui-e-ferramentas-de-desenvolvimento)
3.  [Arquitetura e Desenvolvimento do Sistema](#3-arquitetura-e-desenvolvimento-do-sistema)
    3.1. [Arquitetura Geral](#31-arquitetura-geral)
    3.2. [Modelo de Dados](#32-modelo-de-dados)
    3.3. [Controle de Acesso e Segurança](#33-controle-de-acesso-e-segurança)
    3.4. [Funcionalidades Implementadas](#34-funcionalidades-implementadas)
4.  [Implantação e Ambiente](#4-implantação-e-ambiente)
    4.1. [Containerização com Docker](#41-containerização-com-docker)
    4.2. [Ambiente de Produção](#42-ambiente-de-produção)
5.  [Resultados e Demonstração](#5-resultados-e-demonstração)
    5.1. [Painel do Gestor](#51-painel-do-gestor)
    5.2. [Painel do Responsável](#52-painel-do-responsável)
    5.3. [Painel do Cuidador](#53-painel-do-cuidador)
6.  [Conclusão e Trabalhos Futuros](#6-conclusão-e-trabalhos-futuros)
7.  [Solução de Problemas (Troubleshooting)](#7-solução-de-problemas-troubleshooting)

---

## 1. Introdução

### 1.1. Contextualização e Problema

Instituições de ensino enfrentam o desafio crescente de gerenciar de forma eficiente e segura as informações de estudantes com necessidades atípicas. A descentralização de dados em planilhas, documentos físicos e sistemas isolados gera ineficiência, dificulta a comunicação entre os profissionais envolvidos (gestores, cuidadores) e as famílias, e cria riscos à privacidade e segurança das informações sensíveis dos estudantes.

### 1.2. Justificativa

A plataforma "Gestão Atípicos" surge como uma solução centralizada para este problema. Ao oferecer um ambiente único e seguro, o sistema promove a colaboração, garante que as informações corretas estejam acessíveis às pessoas certas e otimiza a rotina administrativa. Isso permite que a equipe pedagógica dedique mais tempo ao que realmente importa: o cuidado e o desenvolvimento dos estudantes.

### 1.3. Objetivos

#### Objetivo Geral
Desenvolver uma plataforma web para centralizar e gerenciar o cadastro, acompanhamento e atribuição de cuidadores a estudantes atípicos, garantindo segurança, privacidade e colaboração entre os envolvidos.

#### Objetivos Específicos
- Implementar um sistema de autenticação com perfis de acesso distintos: Gestor, Responsável e Cuidador.
- Desenvolver um painel de controle (dashboard) para cada perfil, com funcionalidades e visualizações específicas.
- Criar funcionalidades completas de CRUD (Create, Read, Update, Delete) para usuários e estudantes.
- Implementar um sistema de atribuição que vincule cuidadores a estudantes.
- Desenvolver uma funcionalidade de importação de dados em massa (CSV/XLSX) para agilizar o cadastro inicial.
- Garantir a segurança e a privacidade dos dados através de políticas de acesso no nível do banco de dados (Row Level Security).

---

## 2. Fundamentação Teórica e Tecnologias

A escolha da stack tecnológica foi pautada na busca por produtividade, escalabilidade e segurança.

### 2.1. Frontend

- **Vite:** Ferramenta de build moderna que oferece um ambiente de desenvolvimento extremamente rápido com Hot Module Replacement (HMR).
- **React:** Biblioteca consolidada para a criação de interfaces de usuário reativas e componentizadas.
- **TypeScript:** Adiciona tipagem estática ao JavaScript, aumentando a segurança do código, facilitando a manutenção e melhorando a experiência de desenvolvimento.
- **TanStack Query (React Query):** Gerencia o estado do servidor, simplificando o data-fetching, caching, e a sincronização de dados, o que torna a UI mais resiliente e otimista.

### 2.2. Backend e Banco de Dados

- **Supabase:** Utilizado como Backend as a Service (BaaS), provê uma infraestrutura completa sobre o PostgreSQL.
  - **Banco de Dados PostgreSQL:** Um dos bancos de dados relacionais mais poderosos e confiáveis do mercado.
  - **Autenticação:** Sistema de gerenciamento de usuários e autenticação (JWT) integrado.
  - **Edge Functions:** Funções serverless (Deno) para executar lógica de backend, como o processamento de importações em massa, de forma segura e escalável.
  - **Storage:** Armazenamento de arquivos (buckets) para laudos e documentos, com políticas de acesso integradas ao banco de dados.
  - **APIs em Tempo Real:** Permite que a aplicação "escute" mudanças no banco de dados e atualize a UI instantaneamente.

### 2.3. UI e Ferramentas de Desenvolvimento

- **Shadcn/UI & Tailwind CSS:** Combinação poderosa para criar interfaces modernas e customizáveis. Shadcn/UI oferece componentes acessíveis e bem estruturados, enquanto o Tailwind CSS permite uma estilização rápida e consistente.
- **React Hook Form & Zod:** Para gerenciamento de formulários e validação de schemas. O Zod, em particular, permite a validação de dados com inferência de tipos, garantindo consistência entre o frontend e o backend.
- **Lucide React:** Biblioteca de ícones leve e customizável.

### 2.4. Segurança e Observabilidade

- **SIEM (Security Information and Event Management):** O sistema integra-se a uma infraestrutura de monitoramento externa ([Repositório do SIEM](https://github.com/z12guilherme/gestao_atipicos-siem)) para detecção de ameaças em tempo real, correlacionando logs de acesso, erros e eventos de segurança.
- **Defesa Ativa:** Utilização de **Honeytokens** (credenciais isca) e endpoints monitorados para identificar e bloquear atacantes proativamente.

---

## 3. Arquitetura e Desenvolvimento do Sistema

### 3.1. Arquitetura Geral

A aplicação segue uma arquitetura cliente-servidor, onde o frontend (React/Vite) é responsável pela interface e experiência do usuário, e o Supabase atua como o backend, gerenciando dados, autenticação e lógica de negócio.

 <!-- Sugestão: Crie um diagrama simples e hospede a imagem -->

### 3.2. Modelo de Dados

O banco de dados no Supabase foi modelado para refletir as entidades principais do sistema:

![Diagrama do Banco de Dados](./img/Diagrama-Banco%20de-Dados.png)

- **`profiles`:** Armazena os dados de todos os usuários (gestores, cuidadores, responsáveis), incluindo nome, email e o perfil (`role`). Está vinculada à tabela `auth.users` do Supabase.
- **`students`:** Contém todas as informações dos estudantes, como nome, data de nascimento, status, turma, diagnóstico e dados médicos.
- **`caregivers_students`:** Tabela de associação (N-para-N) que vincula um cuidador a um ou mais estudantes.
- **`guardians_students`:** Tabela de associação que vincula um responsável a um ou mais estudantes (seus filhos/dependentes).

### 3.3. Controle de Acesso e Segurança

A segurança do projeto adota uma estratégia de **Defesa em Profundidade (Defense in Depth)**, indo muito além do controle de acesso básico.

#### 3.3.1. Segurança de Dados (Data Security)
- **Row Level Security (RLS):** A lógica de autorização reside no banco de dados.
  - **Storage Policies:** Controle de acesso a arquivos (laudos) baseado nas mesmas regras de negócio do banco de dados.
- **Gestores** possam ver e modificar todos os dados.
- **Responsáveis** possam visualizar apenas os dados dos estudantes vinculados a eles.
- **Cuidadores** possam visualizar apenas os dados dos estudantes que lhes foram atribuídos.
- **Criptografia:** Dados em trânsito (TLS 1.3) e em repouso (AES-256).

#### 3.3.2. Segurança Ofensiva e Defensiva
 - **Pentest Blackbox:** A aplicação foi submetida a testes de intrusão rigorosos (Dez/2025), incluindo tentativas de escalação de privilégio vertical e manipulação de API, sem detecção de vulnerabilidades críticas.
- **Defesa Ativa (Active Defense):** Implementação de **Honeytokens** (credenciais isca) e endpoints monitorados para detectar tentativas de exploração.
- **Monitoramento (SIEM):** Integração com infraestrutura de SIEM dedicada para correlação de logs e detecção de ameaças em tempo real.
- **Conformidade:** Aderência ao checklist **OWASP ASVS (Nível 1)** e diretrizes da **LGPD**.

### 3.4. Funcionalidades Implementadas

As funcionalidades descritas nos objetivos foram implementadas através de componentes React, hooks customizados (`useStudents`, `useUsers`) e interações com a API do Supabase. A importação em massa para gestores, por exemplo, utiliza uma Edge Function (`bulk-create-students`) para processar os dados no servidor, garantindo melhor performance e segurança. Recentemente, foram adicionados o módulo de **Gestão de Documentos**, permitindo o upload seguro de laudos médicos (PDF), e a **importação de cronogramas** para cuidadores via planilha.

---

## 4. Implantação e Ambiente

### 4.1. Containerização com Docker

Para facilitar a implantação e garantir a consistência do ambiente, o projeto foi configurado para ser executado em um container Docker. O `Dockerfile` utiliza uma abordagem de **múltiplos estágios**:

1.  **Estágio de Build:** Usa uma imagem Node.js para instalar as dependências e compilar a aplicação React, gerando os arquivos estáticos otimizados.
2.  **Estágio de Produção:** Usa uma imagem leve do Nginx para servir os arquivos estáticos gerados no estágio anterior. Isso resulta em uma imagem final pequena e segura, contendo apenas o necessário para executar a aplicação.

### 4.2. Ambiente de Produção

A aplicação está hospedada na **Vercel**, uma plataforma otimizada para aplicações frontend modernas. A Vercel se integra diretamente ao repositório do GitHub, automatizando o processo de build e deploy a cada novo commit na branch principal.

**URL da Aplicação:** https://gestao-atipicos.vercel.app/

### 4.3. Aplicativo Móvel (PWA & APK)

O projeto foi configurado como uma **Progressive Web App (PWA)**, o que significa que ele pode ser "instalado" diretamente do navegador em qualquer dispositivo (celular ou computador), funcionando como um aplicativo nativo com suporte offline.

#### Instalação via Navegador (PWA)
- **Android (Chrome):** Abra o site, vá no menu (três pontos) e selecione "Instalar aplicativo".
- **iOS (Safari):** Toque no botão de compartilhamento e selecione "Adicionar à Tela de Início".
- **Desktop (Chrome/Edge):** Um ícone de instalação aparecerá na barra de endereço.

#### Geração do APK (Android)
Para distribuir o aplicativo como um arquivo `.apk` para Android, o projeto utiliza o **Capacitor**.

1.  **Build do Projeto:**
    ```bash
    npm run build
    ```
2.  **Sincronização com o Android:**
    ```bash
    npx cap sync
    ```
3.  **Abertura no Android Studio:**
    ```bash
    npx cap open android
    ```
    Dentro do Android Studio, o APK pode ser gerado através do menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 5. Resultados e Demonstração

Nesta seção, detalhamos o funcionamento de cada painel da plataforma, servindo como um guia de uso para os diferentes perfis de usuário.

### 5.1. Painel do Gestor

O gestor tem uma visão completa do sistema, com dashboards e ferramentas para gerenciar todas as entidades da plataforma.

#### Dashboard Principal
Ao fazer login, o gestor é recebido com um painel interativo que exibe:
- **Estatísticas em Tempo Real:** Cards coloridos e intuitivos mostram o total de alunos, usuários, cuidadores e turmas.
- **Ações Rápidas:** Um card dedicado oferece um atalho para a tela de "Gerenciar Vínculos", uma das funcionalidades centrais do sistema.
- **Gráficos de Análise:**
  - **Alunos por Turma:** Um gráfico de barras que ilustra a distribuição de estudantes nas turmas cadastradas, permitindo uma análise rápida da lotação.
   - **Distribuição de Usuários:** Um gráfico de rosca (Donut Chart) moderno que mostra a proporção de cada perfil no sistema, com legendas claras e cores padronizadas.

#### Funcionalidades de Gerenciamento (CRUD)
Através do menu lateral, o gestor pode acessar as seguintes áreas:
- **Gerenciar Usuários:** Criar, editar e excluir perfis de gestores, cuidadores e responsáveis.
- **Gerenciar Alunos:** Cadastrar novos estudantes, editar suas informações (dados pessoais, médicos, diagnóstico), anexar laudos médicos (PDF) e vincular/desvincular responsáveis e cuidadores diretamente no perfil do aluno.
- **Gerenciar Vínculos:** Uma tela dedicada para visualizar e gerenciar as associações entre cuidadores e estudantes, facilitando a atribuição e identificando alunos que ainda precisam de um cuidador.

#### Importação em Massa
Para otimizar o cadastro inicial, o gestor pode importar múltiplos usuários ou estudantes de uma vez a partir de arquivos **CSV** ou **XLSX**. A funcionalidade inclui o download de um modelo para garantir o preenchimento correto dos dados.

### 5.2. Painel do Responsável

O painel do responsável foi projetado para ser um ambiente acolhedor e informativo, onde pais e mães podem acompanhar de perto o desenvolvimento de seus filhos.

#### Navegação e Visualização
- **Seleção de Filho:** Caso o responsável tenha mais de um filho matriculado, uma navegação por abas no topo da tela permite alternar facilmente entre os perfis.
- **Cabeçalho do Estudante:** Um card de destaque exibe o nome, foto (avatar), turma e status do estudante selecionado, criando um ponto focal claro.

#### Detalhes do Acompanhamento
O painel é dividido em duas colunas para uma organização clara:
- **Coluna Principal:**
  - **Dados Pessoais:** Informações como data de nascimento, diagnóstico, necessidades especiais e dados médicos.
  - **Documentação:** Botão para visualização segura do laudo médico do estudante diretamente na plataforma.
  - **Análise de Atividades:** Apresenta indicadores-chave (KPIs) como o total de observações e a data do último registro. Um gráfico de barras mostra a frequência de observações por semana, oferecendo uma visão visual do acompanhamento.
- **Coluna Lateral:**
  - **Cronograma do Dia:** Exibe as atividades programadas para o estudante no dia corrente (ex: "Acolhimento", "Terapia Ocupacional").
  - **Últimas Observações:** Uma lista rolável com os registros mais recentes feitos pelos cuidadores, permitindo que os pais fiquem a par do dia a dia do filho.

### 5.3. Painel do Cuidador

O painel do cuidador é uma ferramenta de trabalho focada na organização e no registro de informações.
Para otimizar o planejamento, o cuidador pode importar o cronograma diário de atividades de seus estudantes através de uma planilha Excel, que é processada e validada pelo sistema para popular a agenda.

#### Dashboard Principal
Ao fazer login, o cuidador visualiza uma lista clara e objetiva dos estudantes que estão sob sua responsabilidade. Cada estudante é apresentado em um card, facilitando a identificação e o acesso rápido às suas informações.

#### Funcionalidades (Atuais e Futuras)
- **Visualização de Estudantes:** Acesso rápido aos perfis dos estudantes atribuídos, incluindo visualização de laudos médicos para suporte pedagógico e de saúde.
- **Registro de Observações:** O cuidador pode selecionar um estudante e registrar observações sobre seu progresso, comportamento ou eventos importantes do dia. Essa informação fica imediatamente disponível para o responsável no seu painel.

---

## 6. Conclusão e Trabalhos Futuros

O projeto "Gestão Atípicos" atingiu com sucesso seus objetivos, entregando uma plataforma 100% funcional, segura e escalável. A solução centraliza a gestão de estudantes atípicos, otimiza a comunicação entre cuidadores e responsáveis e fornece ferramentas administrativas poderosas para os gestores. A arquitetura moderna e a experiência de usuário refinada consolidam o sistema como uma base sólida e pronta para uso.

Como próximos passos, o projeto pode evoluir nas seguintes áreas:

- **Módulo de Comunicação Direta:** Implementar um sistema de chat em tempo real para facilitar a comunicação instantânea entre cuidadores e responsáveis, permitindo a troca de mensagens privadas e seguras.
- **Relatórios e Análises:** Criar um módulo para que gestores possam gerar relatórios personalizados sobre a frequência de observações, evolução dos estudantes e carga de trabalho dos cuidadores.
- **Notificações:** Sistema de notificações (na plataforma, por e-mail ou push) para avisar sobre novas observações, mensagens ou alertas importantes.
- **Integração com Calendário:** Sincronizar o cronograma de atividades dos estudantes com calendários externos (Google Calendar, Outlook Calendar) para pais e cuidadores.
- **Plano de Desenvolvimento Individual (PDI):** Módulo para criar, acompanhar e avaliar metas e objetivos específicos para cada estudante, com a colaboração de professores, cuidadores e responsáveis.

Este projeto demonstra o grande potencial da tecnologia para resolver problemas reais no setor educacional, oferecendo ferramentas que apoiam e valorizam o trabalho de todos os envolvidos no processo de inclusão.

---

## 7. Solução de Problemas (Troubleshooting)

### Problema: Logout não funciona / Sessão travada

Em alguns casos, ao tentar sair do sistema, o logout pode falhar devido a uma sessão inválida ou expirou. Isso é detectado com erros como:

- `AuthSessionMissingError: Auth session missing!`
- `Failed to load resource: the server responded with a status of 403`

#### Solução

Para limpar completamente a sessão do navegador, você pode executar o seguinte snippet no **Console do DevTools**:

> ⚠️ **Aviso:** Digite `allow pasting` no Console antes de colar este código.

```javascript
// Limpa dados de sessão
localStorage.clear();
sessionStorage.clear();

// Remove cookies de autenticação
document.cookie.split(";").forEach(function(c) {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Recarrega a página para aplicar mudanças
location.reload();
```