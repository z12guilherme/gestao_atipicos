# Roteiro de Apresentação Técnica - Gestão de Atípicos

Este guia serve como roteiro para a gravação do vídeo de apresentação técnica do sistema, destacando a arquitetura, tecnologias e qualidade de código.

## 1. Visão Geral e Stack Tecnológica
**Arquivo:** `package.json`
*   **O que mostrar:** As dependências principais.
*   **O que falar:** "O projeto é um frontend moderno construído com **React**, **Vite** e **TypeScript**. Utilizo **Supabase** como Backend-as-a-Service, **TanStack Query** para gerenciamento de estado assíncrono e cache, e **Tailwind CSS** com **Shadcn/ui** para a interface."

## 2. Gerenciamento de Estado e Tipagem (CRUD)
**Arquivo:** `src/hooks/useStudents.tsx`
*   **O que mostrar:** A interface `Student` e o hook `useQuery`.
*   **O que falar:** "Para a comunicação com o banco de dados, encapsulei a lógica em Hooks customizados. Aqui no `useStudents`, podemos ver a tipagem forte com TypeScript e o uso do `useQuery` para buscar dados com relacionamentos complexos, além de Mutations para operações de escrita com invalidação de cache automática."

## 3. Regras de Negócio e Tratamento de Erros
**Arquivo:** `src/hooks/useSchedules.ts`
*   **O que mostrar:** A função `addSchedule` e o bloco `catch`.
*   **O que falar:** "A lógica de agendamento trata regras de negócio específicas. Por exemplo, na função `addSchedule`, faço o tratamento de erros do banco de dados, como códigos de conflito de horário ou violação de unicidade, garantindo feedback preciso para o usuário."

## 4. Funcionalidades Avançadas (Importação de Arquivos)
**Arquivo:** `src/hooks/useFileImport.ts`
*   **O que mostrar:** A lógica de parsing (CSV/Excel) e validação.
*   **O que falar:** "Implementei uma funcionalidade avançada de importação de dados via Excel e CSV. O sistema faz o parsing do arquivo no frontend, valida a estrutura dos dados removendo linhas vazias e envia para o backend processar em lote."

## 5. Integração com Backend e Segurança (Serverless)
**Arquivo:** `src/hooks/useUsers.ts`
*   **O que mostrar:** A chamada `supabase.functions.invoke`.
*   **O que falar:** "Para operações sensíveis como criação de usuários, utilizo **Edge Functions** do Supabase. Isso garante que a lógica de criação de usuários e permissões rode em um ambiente seguro no servidor, e não no cliente."

## 6. Infraestrutura e Deploy
**Arquivo:** `Dockerfile`
*   **O que mostrar:** Os estágios `build` e `nginx`.
*   **O que falar:** "O projeto está containerizado para produção. Utilizo um **Multi-stage build**: o primeiro estágio compila o React com Vite, e o segundo estágio serve os arquivos estáticos usando um servidor **Nginx** leve e performático."