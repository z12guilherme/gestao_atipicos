# 📄 Documentação do Projeto: Gestão Atípicos

**Autor:** Marcos Guilherme  
**Email:** mguimarcos39@gmail.com  
**Data:** Outubro de 2023 (ou a data atual)

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
  - **APIs em Tempo Real:** Permite que a aplicação "escute" mudanças no banco de dados e atualize a UI instantaneamente.

### 2.3. UI e Ferramentas de Desenvolvimento

- **Shadcn/UI & Tailwind CSS:** Combinação poderosa para criar interfaces modernas e customizáveis. Shadcn/UI oferece componentes acessíveis e bem estruturados, enquanto o Tailwind CSS permite uma estilização rápida e consistente.
- **React Hook Form & Zod:** Para gerenciamento de formulários e validação de schemas. O Zod, em particular, permite a validação de dados com inferência de tipos, garantindo consistência entre o frontend e o backend.
- **Lucide React:** Biblioteca de ícones leve e customizável.

---

## 3. Arquitetura e Desenvolvimento do Sistema

### 3.1. Arquitetura Geral

A aplicação segue uma arquitetura cliente-servidor, onde o frontend (React/Vite) é responsável pela interface e experiência do usuário, e o Supabase atua como o backend, gerenciando dados, autenticação e lógica de negócio.

 <!-- Sugestão: Crie um diagrama simples e hospede a imagem -->

### 3.2. Modelo de Dados

O banco de dados no Supabase foi modelado para refletir as entidades principais do sistema:

- **`profiles`:** Armazena os dados de todos os usuários (gestores, cuidadores, responsáveis), incluindo nome, email e o perfil (`role`). Está vinculada à tabela `auth.users` do Supabase.
- **`students`:** Contém todas as informações dos estudantes, como nome, data de nascimento, status, turma, diagnóstico e dados médicos.
- **`caregivers_students`:** Tabela de associação (N-para-N) que vincula um cuidador a um ou mais estudantes.
- **`guardians_students`:** Tabela de associação que vincula um responsável a um ou mais estudantes (seus filhos/dependentes).

### 3.3. Controle de Acesso e Segurança

A segurança é um pilar do projeto. Ela é garantida principalmente pelo **Row Level Security (RLS)** do PostgreSQL, configurado no Supabase. As políticas de RLS garantem que:

- **Gestores** possam ver e modificar todos os dados.
- **Responsáveis** possam visualizar apenas os dados dos estudantes vinculados a eles.
- **Cuidadores** possam visualizar apenas os dados dos estudantes que lhes foram atribuídos.

Essa abordagem move a lógica de segurança para o banco de dados, tornando a aplicação inerentemente mais segura.

### 3.4. Funcionalidades Implementadas

As funcionalidades descritas nos objetivos foram implementadas através de componentes React, hooks customizados (`useStudents`, `useUsers`) e interações com a API do Supabase. A importação em massa, por exemplo, utiliza uma Edge Function (`bulk-create-students`) para processar os dados no servidor, garantindo melhor performance e segurança.

---

## 4. Implantação e Ambiente

### 4.1. Containerização com Docker

Para facilitar a implantação e garantir a consistência do ambiente, o projeto foi configurado para ser executado em um container Docker. O `Dockerfile` utiliza uma abordagem de **múltiplos estágios**:

1.  **Estágio de Build:** Usa uma imagem Node.js para instalar as dependências e compilar a aplicação React, gerando os arquivos estáticos otimizados.
2.  **Estágio de Produção:** Usa uma imagem leve do Nginx para servir os arquivos estáticos gerados no estágio anterior. Isso resulta em uma imagem final pequena e segura, contendo apenas o necessário para executar a aplicação.

### 4.2. Ambiente de Produção

A aplicação está hospedada na **Vercel**, uma plataforma otimizada para aplicações frontend modernas. A Vercel se integra diretamente ao repositório do GitHub, automatizando o processo de build e deploy a cada novo commit na branch principal.

**URL da Aplicação:** https://gestao-atipicos.vercel.app/

---

## 5. Resultados e Demonstração

*(Nesta seção, você pode adicionar screenshots de cada painel para ilustrar o funcionamento)*

### 5.1. Painel do Gestor

O gestor tem uma visão completa do sistema, com dashboards e ferramentas para gerenciar todas as entidades da plataforma.

*(Screenshot do dashboard do gestor)*

### 5.2. Painel do Responsável

O responsável tem acesso a um painel limpo e focado, com as informações relevantes sobre seus dependentes, respeitando a privacidade.

*(Screenshot do painel do responsável)*

### 5.3. Painel do Cuidador

O cuidador visualiza uma lista clara dos estudantes sob sua responsabilidade, facilitando a organização do seu trabalho diário.

*(Screenshot do painel do cuidador)*

---

## 6. Conclusão e Trabalhos Futuros

O projeto "Gestão Atípicos" atingiu com sucesso seus objetivos iniciais, entregando uma plataforma funcional, segura e escalável para a gestão de estudantes atípicos. A arquitetura escolhida provou-se eficiente, permitindo um desenvolvimento rápido e uma base sólida para futuras expansões.

Como próximos passos, o projeto pode evoluir nas seguintes áreas:

- **Módulo de Comunicação:** Implementar um sistema de chat ou mural de recados para facilitar a comunicação entre cuidadores e responsáveis.
- **Registro de Ocorrências e Evolução:** Permitir que cuidadores registrem observações diárias sobre o progresso, comportamento e eventos importantes relacionados a cada estudante.
- **Relatórios e Análises:** Criar um módulo para que gestores possam gerar relatórios personalizados sobre a frequência, evolução e necessidades dos estudantes.
- **Notificações:** Sistema de notificações por e-mail ou push para avisar sobre novas mensagens, atribuições ou alertas importantes.
- **Integração com Calendário:** Sincronizar a agenda de atividades com calendários externos (Google Calendar, etc.).

Este projeto demonstra o grande potencial da tecnologia para resolver problemas reais no setor educacional, oferecendo ferramentas que apoiam e valorizam o trabalho de todos os envolvidos no processo de inclusão.