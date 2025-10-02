<div align="center">
  <h1 align="center">
    <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/heart-handshake.svg" width="40" />
    <br>
    Gestão Atípicos
  </h1>
  <p align="center">
    Plataforma completa para gestão e acompanhamento de estudantes atípicos, conectando cuidadores, famílias e gestores em um ambiente colaborativo e seguro.
  </p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn/UI" />
</p>

---

## ✨ Funcionalidades Principais

O sistema foi projetado com diferentes níveis de acesso, oferecendo um dashboard personalizado para cada perfil de usuário:

#### 👤 **Dashboard do Gestor**
- **Visão Geral:** Cards com estatísticas em tempo real sobre estudantes, cuidadores e responsáveis.
- **Ações Rápidas:** Botões para acesso rápido às principais funcionalidades, como cadastrar novos usuários e estudantes.
- **Gerenciamento Completo (CRUD):**
  - **Usuários:** Crie, edite e exclua perfis de gestores, cuidadores e responsáveis.
  - **Estudantes:** Gerencie os dados completos dos estudantes, incluindo informações médicas e necessidades especiais.
  - **Atribuições:** Vincule cuidadores a estudantes de forma intuitiva.

#### ❤️ **Dashboard do Responsável**
- **Privacidade em Primeiro Lugar:** Acesso restrito apenas às informações dos estudantes vinculados ao seu perfil.
- **Acompanhamento Detalhado:** Visualize dados como turma, status, diagnóstico e necessidades especiais do seu filho(a).

#### 🤝 **Dashboard do Cuidador**
- **Foco no Cuidado:** Visualize rapidamente os estudantes que estão sob sua responsabilidade.
- **Agenda Diária:** Acompanhe as atividades programadas para o dia.
- **Registro de Observações:** (Funcionalidade futura) Ferramenta para registrar o progresso e ocorrências diárias.

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

## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para configurar e rodar a aplicação no seu ambiente de desenvolvimento.

### Pré-requisitos

1.  **Node.js:** Versão 18.x ou superior.
2.  **Supabase Account:** Crie uma conta gratuita em supabase.com.

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/gestao_atipicos-main.git
cd gestao_atipicos-main
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

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Se você tem alguma ideia para melhorar o projeto, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

1.  Faça um *fork* do projeto.
2.  Crie uma nova *branch* (`git checkout -b feature/sua-feature`).
3.  Faça o *commit* das suas alterações (`git commit -m 'Adiciona nova feature'`).
4.  Envie para a sua *branch* (`git push origin feature/sua-feature`).
5.  Abra um *Pull Request*.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

