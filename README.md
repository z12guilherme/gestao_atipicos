<div align="center">
  <h1 align="center">
    <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/heart-handshake.svg" width="40" />
    <br>
    Gestão Atípicos
  </h1>
  <p align="center">
    Plataforma completa para gestão e acompanhamento de estudantes atípicos, conectando cuidadores, famílias e gestores em um ambiente colaborativo e seguro.
  </p>
  <p align="center">
    <a href="https://gestao-atipicos.vercel.app/" target="_blank">
      <strong>Acessar a aplicação →</strong>
    </a>
  </p>
</div>

> **⚠️ Projeto Pausado ⚠️**
>
> O desenvolvimento deste projeto está temporariamente pausado. Fique à vontade para explorar o código, fazer um fork ou entrar em contato para futuras colaborações. A versão atual está funcional e pode ser acessada no link acima.

### ⏸️ Motivo da Pausa: Limitação de Hardware

O desenvolvimento foi pausado por uma limitação de hardware: **um SSD com pouco espaço de armazenamento**. Projetos modernos como este, que utilizam **Docker**, o ecossistema **Node.js** (`node_modules`) e diversas ferramentas de build, consomem uma quantidade significativa de espaço em disco. A constante necessidade de gerenciar o armazenamento tornou o fluxo de trabalho improdutivo.

A decisão de pausar é estratégica, visando um futuro upgrade para permitir um desenvolvimento mais fluido e eficiente.

### 🐳 A Importância do Docker neste Projeto

Você pode se perguntar por que usar Docker se ele consome mais recursos. A resposta está na **confiabilidade e padronização**.

O Docker resolve o clássico problema de engenharia de software: **"funciona na minha máquina, mas não na sua"**. Ele encapsula a aplicação e todas as suas dependências (versão do Node.js, bibliotecas do sistema, etc.) em um "container". Isso garante que o ambiente de desenvolvimento, teste e produção seja **idêntico**, resultando em:

- **Menos bugs** relacionados a diferenças de ambiente.
- **Configuração simplificada** para novos desenvolvedores.
- **Implantações (deploys) mais rápidas e seguras**.

O `Dockerfile` do projeto utiliza uma técnica de **múltiplos estágios** para criar uma imagem final pequena e otimizada, contendo apenas o necessário para a produção. Adotar o Docker é uma prática que eleva a qualidade e a manutenibilidade do projeto a longo prazo.

<p align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn/UI" />
</p>

## 🎯 Status Atual do Projeto

O projeto encontra-se em um estágio avançado de desenvolvimento, com as principais funcionalidades já implementadas e operacionais.

#### ✅ O que está funcionando:
- **Autenticação:** Login e logout funcionam para todos os perfis de usuário (Gestor, Responsável, Cuidador).
- **Painéis por Perfil:**
  - **Gestor:** Visualização de estatísticas, gerenciamento completo (CRUD) de usuários, estudantes e atribuições.
  - **Responsável:** Visualização restrita apenas aos estudantes vinculados ao seu perfil, garantindo a privacidade.
  - **Cuidador:** Visualização dos estudantes sob sua responsabilidade.
- **Importação em Massa:** A interface para importar usuários e estudantes via arquivos CSV/XLSX está pronta.

#### ⚠️ Ponto de Atenção (Última tarefa em andamento):
- A funcionalidade de **criação/importação de usuários** estava apresentando um erro de CORS ao se comunicar com a Edge Function do Supabase. A correção já foi aplicada no código (`supabase/functions/create-user/index.ts`), mas ainda precisa ser implantada no ambiente do Supabase para validar a solução.

---

<!-- Inserir um screenshot ou GIF da aplicação aqui -->
<!-- <p align="center">
  <img src="caminho/para/screenshot.png" alt="Screenshot do Dashboard" />
</p> -->

## ✨ Funcionalidades Principais

O sistema foi projetado com diferentes níveis de acesso, oferecendo um dashboard personalizado para cada perfil de usuário:

#### 👤 **Dashboard do Gestor**
- **Visão Geral:** Dashboard interativo com estatísticas em tempo real sobre estudantes (ativos/inativos), cuidadores e responsáveis.
- **Ações Rápidas:** Acesso rápido para cadastrar novos usuários e estudantes, além de gerenciar atribuições.
- **Gerenciamento Completo (CRUD):**
  - **Usuários:** Crie, edite e exclua perfis de gestores, cuidadores e responsáveis.
  - **Estudantes:** Gerencie os dados completos dos estudantes, incluindo informações médicas e necessidades especiais.
  - **Atribuições:** Vincule cuidadores a estudantes de forma intuitiva.
- **Importação em Massa:** Funcionalidade para importar múltiplos usuários ou estudantes de uma vez a partir de arquivos **CSV** ou **XLSX**, agilizando o cadastro inicial.

#### ❤️ **Dashboard do Responsável**
- **Privacidade em Primeiro Lugar:** Acesso restrito apenas às informações dos estudantes vinculados ao seu perfil.
- **Acompanhamento Detalhado:** Visualize dados como turma, status, diagnóstico e necessidades especiais do seu filho(a).

#### 🤝 **Dashboard do Cuidador**
- **Foco no Cuidado:** Visualize rapidamente os estudantes que estão sob sua responsabilidade.
- **Agenda Diária:** Acompanhe as atividades programadas para o dia.
- **Registro de Observações:** (Funcionalidade futura) Ferramenta para registrar o progresso e ocorrências diárias, facilitando a comunicação com a equipe e a família.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna e robusta, focada em produtividade e escalabilidade.

- **Frontend:**
  - **[Vite](https://vitejs.dev/):** Build tool de alta performance.
  - **[React](https://react.dev/):** Biblioteca para construção de interfaces.
  - **[TypeScript](https://www.typescriptlang.org/):** JavaScript com tipagem estática para maior segurança e manutenibilidade.
- **Backend & Banco de Dados:**
  - **[Supabase](https://supabase.com/):** Plataforma open-source que oferece banco de dados (PostgreSQL), autenticação, Edge Functions e APIs em tempo real.
- **UI & Estilização:**
  - **[Shadcn/UI](https://ui.shadcn.com/):** Coleção de componentes de UI reusáveis e acessíveis.
  - **[Tailwind CSS](https://tailwindcss.com/):** Framework CSS utility-first para estilização rápida.
  - **[Lucide React](https://lucide.dev/):** Biblioteca de ícones open-source.
- **Gerenciamento de Estado e Dados:**
  - **[TanStack Query (React Query)](https://tanstack.com/query/latest):** Para data-fetching, caching e sincronização de estado do servidor.
- **Formulários:**
  - **[React Hook Form](https://react-hook-form.com/):** Gerenciamento de formulários performático e flexível.
  - **[Zod](https://zod.dev/):** Validação de schemas com inferência de tipos.
- **Utilitários:**
  - **[SheetJS (xlsx)](https://sheetjs.com/):** Para leitura e processamento de planilhas XLSX.

## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para configurar e rodar a aplicação no seu ambiente de desenvolvimento.

### Pré-requisitos

1. **Node.js:** Versão 18.x ou superior.
2. **Conta no Supabase:** Crie uma conta gratuita em [supabase.com](https://supabase.com).
3. **Supabase CLI:** Instale a CLI do Supabase para gerenciar as Edge Functions localmente. Siga as [instruções de instalação](https://supabase.com/docs/guides/cli/getting-started).
4. **Docker e Docker Compose:** (Recomendado) Para garantir um ambiente de execução consistente e facilitar o deploy.

### 1. Clonar o Repositório

```bash
git clone https://github.com/z12guilherme/gestao_atipicos.git
cd gestao_atipicos
```

### 2. Instalar as Dependências

Use o gerenciador de pacotes de sua preferência:
```bash
npm install
# ou
yarn install
```

### 3. Configurar Variáveis de Ambiente

1.  Crie um arquivo chamado `.env` na raiz do projeto.
2.  Acesse o painel do seu projeto no Supabase.
3.  Vá para **Project Settings > API**.
4.  Copie a **URL** e a chave **anon (public)**.
5.  Adicione as chaves ao seu arquivo `.env`:

```env
VITE_SUPABASE_URL="SUA_URL_DO_PROJETO_SUPABASE"
VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_PUBLICA_SUPABASE"
```

### 4. Configurar o Banco de Dados Supabase

Para que a aplicação funcione corretamente, você precisará criar as tabelas no seu banco de dados Supabase. Acesse o **SQL Editor** no painel do Supabase e execute os scripts SQL necessários para criar as tabelas `profiles`, `students`, `caregivers_students` e `guardians_students`.

> **Nota:** É fundamental configurar as políticas de **Row Level Security (RLS)** para garantir que os usuários só possam acessar os dados que lhes são permitidos.

### 5. Iniciar o Servidor de Desenvolvimento

Com tudo configurado, inicie a aplicação:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## 📖 Guia de Uso

### Acesso à Plataforma

Para começar, acesse a plataforma através do link fornecido e utilize o email e a senha cadastrados para fazer login. A plataforma possui três perfis de acesso, cada um com seu próprio painel.

### 👤 Painel do Gestor

O gestor possui acesso total ao sistema, permitindo o gerenciamento completo de usuários, estudantes e atribuições.

*   **Gerenciamento de Usuários:** Crie, visualize, edite e exclua perfis. É possível importar múltiplos usuários de uma vez a partir de arquivos **CSV** ou **XLSX**.
*   **Gerenciamento de Estudantes:** Centralize todas as informações dos estudantes, incluindo dados médicos e necessidades. A importação em massa também está disponível para estudantes.
*   **Gerenciamento de Atribuições:** Vincule cuidadores aos estudantes que eles irão acompanhar. O painel mostra os estudantes agrupados por cuidador e uma lista de estudantes que ainda não foram atribuídos.

### ❤️ Painel do Responsável

Como responsável, você tem acesso a um painel focado na privacidade e no acompanhamento do(s) seu(s) filho(s).

*   **Visualizando Informações:** Ao fazer login, você verá uma lista dos estudantes vinculados ao seu perfil, podendo consultar dados como turma, status, diagnóstico e necessidades especiais. O acesso é restrito apenas aos seus dependentes.

### 🤝 Painel do Cuidador

O painel do cuidador foi projetado para focar nas suas atividades diárias e no acompanhamento dos estudantes sob sua responsabilidade.

*   **Meus Estudantes:** A tela principal exibe uma lista clara de todos os estudantes que foram atribuídos a você pelo gestor.
*   **Agenda Diária e Observações (Funcionalidades Futuras):** Em breve, o cuidador poderá visualizar a agenda de atividades e registrar observações sobre o progresso e ocorrências do dia.

---

## 🐳 Executando com Docker

O uso de Docker é **altamente recomendado** para este projeto, pois ele resolve o clássico problema de "funciona na minha máquina". Ao encapsular a aplicação e suas dependências em um container, garantimos que o ambiente de desenvolvimento, teste e produção seja idêntico, evitando inconsistências.

O `Dockerfile` do projeto utiliza uma abordagem de múltiplos estágios para criar uma imagem otimizada e segura, servindo a aplicação React com Nginx.

Para facilitar a implantação e garantir um ambiente consistente, o projeto pode ser executado em um container Docker.

1.  **Construir a imagem:**
    ```bash
    docker build -t gestao-atipicos .
    ```
2.  **Executar o container:**
    ```bash
    docker run -p 8080:80 gestao-atipicos
    ```

A aplicação estará disponível em `http://localhost:8080`.

---

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Se você tem alguma ideia para melhorar o projeto, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

1.  Faça um *fork* do projeto.
2.  Crie uma nova *branch* (`git checkout -b feature/sua-feature`).
3.  Faça o *commit* das suas alterações (`git commit -m 'Adiciona nova feature'`).
4.  Envie para a sua *branch* (`git push origin feature/sua-feature`).
5.  Abra um *Pull Request*.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

DEV: Marcos Guilherme | Email: mguimarcos39@gmail.com
