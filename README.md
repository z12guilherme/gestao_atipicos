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

<p align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn/UI" />
</p>

---

## 🎯 Status Atual do Projeto
O projeto atingiu um estágio estável, com todas as funcionalidades centrais implementadas e prontas para uso.  
A plataforma oferece painéis dedicados e seguros para Gestores, Responsáveis e Cuidadores, garantindo uma gestão eficiente e um acompanhamento detalhado dos estudantes.

---

## 🖼️ Telas da Aplicação

<details>
<summary>Clique para ver as telas</summary>

### Painel do Gestor
<p align="center">
  <img src="https://raw.githubusercontent.com/z12guilherme/gestao_atipicos/main/img/print-administrador.JPG" alt="Screenshot do Dashboard do Gestor" />
</p>

### Painel do Responsável
<p align="center">
  <img src="https://raw.githubusercontent.com/z12guilherme/gestao_atipicos/main/img/print-responsavel.JPG" alt="Screenshot do Dashboard do Responsável" />
</p>

### Painel do Cuidador
<p align="center">
  <img src="https://raw.githubusercontent.com/z12guilherme/gestao_atipicos/main/img/print-cuidador.JPG" alt="Screenshot do Dashboard do Cuidador" />
</p>

</details>

---

## ✨ Funcionalidades Principais

O sistema foi projetado com diferentes níveis de acesso, oferecendo um dashboard personalizado para cada perfil de usuário:

#### 👤 **Dashboard do Gestor**
- **Visão Geral:** Dashboard interativo com estatísticas em tempo real sobre estudantes, cuidadores e responsáveis.  
- **Ações Rápidas:** Cadastro e gerenciamento ágil de usuários e estudantes.  
- **Importação em Massa:** Cadastramento via arquivos **CSV** ou **XLSX**, otimizando a inserção de dados.  
- **Vínculos Inteligentes:** Associação dinâmica entre cuidadores e estudantes.

#### ❤️ **Dashboard do Responsável**
- **Privacidade em Primeiro Lugar:** Visualização apenas dos dependentes vinculados.  
- **Acompanhamento Detalhado:** Acesso a dados de turma, diagnóstico e necessidades especiais.

#### 🤝 **Dashboard do Cuidador**
- **Foco no Cuidado:** Exibição dos estudantes sob sua responsabilidade.  
- **Agenda e Observações:** Funcionalidades futuras para registro de progresso e comunicação com a equipe.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** Vite, React, TypeScript  
- **Backend & Banco de Dados:** Supabase (PostgreSQL, Auth e Edge Functions)  
- **UI & Estilização:** Shadcn/UI, Tailwind CSS, Lucide React  
- **Gerenciamento de Estado:** TanStack Query (React Query)  
- **Formulários e Validação:** React Hook Form, Zod  
- **Utilitários:** SheetJS (xlsx)

---

## ⚙️ Como Executar o Projeto Localmente

### 1. Clone o Repositório
```bash
git clone https://github.com/z12guilherme/gestao_atipicos.git
cd gestao_atipicos
2. Instale as Dependências
bash
Copiar código
npm install
# ou
yarn install
3. Configure o Ambiente
Crie um arquivo .env na raiz do projeto com:

env
Copiar código
VITE_SUPABASE_URL="SUA_URL_DO_PROJETO_SUPABASE"
VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_PUBLICA_SUPABASE"
4. Execute a Aplicação
bash
Copiar código
npm run dev
Acesse em: http://localhost:5173

🐳 Execução via Docker
bash
Copiar código
docker build -t gestao-atipicos .
docker run -p 8080:80 gestao-atipicos
Acesse em http://localhost:8080.

🎬 Apresentação do Projeto
<p align="center"> <a href="https://www.youtube.com/watch?v=BjTLM1idajQ" target="_blank"> <img src="https://img.youtube.com/vi/BjTLM1idajQ/0.jpg" width="70%" alt="Apresentação do Projeto Gestão Atípicos no YouTube" /> </a> </p>
Assista ao vídeo completo da apresentação do projeto no YouTube:
🔗 https://www.youtube.com/watch?v=BjTLM1idajQ

🤝 Contribuição
Contribuições são bem-vindas!
Abra uma issue ou envie um pull request com suas melhorias.

📄 Licença
Este projeto está sob a licença MIT.
Veja o arquivo LICENSE para mais detalhes.

👨‍💻 Autor
Marcos Guilherme
Bacharelando em Sistemas da Informação\
Desenvolvedor Full Stack\
📍 Belo Jardim - PE\
🔗 GitHub






