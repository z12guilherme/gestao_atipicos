# 📘 Manual do Usuário - Gestão Atípicos

Bem-vindo(a) ao Gestão Atípicos! Este manual foi criado para guiar você através das funcionalidades da plataforma, garantindo que você aproveite ao máximo todos os recursos disponíveis.

## 1. Acesso à Plataforma

Para começar, acesse a plataforma através do link fornecido pela sua instituição e utilize o email e a senha cadastrados para fazer login.

- **Página de Login:** Insira suas credenciais.
- **Esqueci minha senha:** Caso tenha esquecido sua senha, utilize a opção de recuperação para redefini-la.

A plataforma possui três perfis de acesso principais, cada um com seu próprio painel e funcionalidades específicas.

---

## 2. 👤 Painel do Gestor

O gestor possui acesso total ao sistema, permitindo o gerenciamento completo de usuários, estudantes e atribuições.

### Dashboard do Gestor

Ao fazer login, você verá um painel com estatísticas rápidas:
- **Total de Estudantes:** Número de estudantes ativos e inativos.
- **Total de Cuidadores:** Quantidade de cuidadores cadastrados.
- **Total de Responsáveis:** Quantidade de responsáveis cadastrados.

### Gerenciamento de Usuários

Nesta seção, você pode criar, visualizar, editar e excluir perfis de gestores, cuidadores e responsáveis.

#### Criando um Novo Usuário
1. Clique em **"Gerenciar Usuários"** e depois no botão **"Novo Usuário"**.
2. Preencha os campos obrigatórios:
   - **Nome Completo**
   - **Email** (será usado para login)
   - **Senha** (mínimo de 6 caracteres)
   - **Tipo de Perfil** (`Gestor`, `Cuidador` ou `Responsável`).
3. Preencha os campos adicionais conforme o perfil (ex: Função e Horário para cuidadores).
4. Clique em **"Criar"**.

#### Importando Usuários em Massa
Para agilizar o cadastro, você pode importar múltiplos usuários de uma vez.
1. Clique no botão **"Importar"**.
2. Baixe o modelo de planilha no formato **CSV** ou **XLSX**.
3. Preencha a planilha com os dados dos usuários, seguindo as observações abaixo.
4. Selecione o arquivo preenchido e clique em **"Iniciar Importação"**.

**Observações para o Preenchimento da Planilha de Usuários:**

| Coluna           | Obrigatório? | Descrição                                                                                             | Exemplo                               |
|------------------|:------------:|-------------------------------------------------------------------------------------------------------|---------------------------------------|
| `name`           |      Sim     | Nome completo do usuário.                                                                             | `João da Silva`                       |
| `email`          |      Sim     | Email único do usuário, que será usado para o login.                                                  | `joao.silva@email.com`                |
| `password`       |      Sim     | Senha de acesso com no mínimo 6 caracteres.                                                           | `senhaSegura123`                      |
| `role`           |      Sim     | Perfil do usuário. Deve ser um dos seguintes valores (exatamente como escrito): `gestor`, `cuidador`, `responsavel`, `professor`. | `cuidador`                            |
| `cpf`            |      Não     | CPF do usuário.                                                                                       | `123.456.789-00`                      |
| `phone`          |      Não     | Telefone de contato.                                                                                  | `(99) 99999-9999`                     |
| `function_title` |      Não     | Título da função (relevante para cuidadores e professores).                                           | `Cuidador de Apoio`                   |
| `work_schedule`  |      Não     | Horário de trabalho (relevante para cuidadores e professores).                                        | `Seg-Sex, 8h-17h`                     |

### Gerenciamento de Estudantes

Centralize todas as informações dos estudantes atípicos.

#### Cadastrando um Novo Estudante
1. Clique em **"Gerenciar Estudantes"** e depois em **"Novo Estudante"**.
2. Preencha as informações do estudante.
3. **Vínculos:** Na mesma tela, você pode selecionar um ou mais **responsáveis** e **cuidadores** da lista para vincular ao estudante.
4. Clique em **"Criar"** ou **"Salvar"**.

#### Importando Estudantes em Massa
1. Na tela de gerenciamento de estudantes, clique em **"Importar"**.
2. Baixe o modelo **CSV** ou **XLSX**.
3. Preencha a planilha com os dados. As colunas obrigatórias são `name`, `birth_date` e `status`.
4. Selecione o arquivo e inicie a importação.

### Gerenciamento de Vínculos

A gestão de vínculos foi centralizada no **cadastro do estudante** para um fluxo mais intuitivo. No entanto, a tela de **"Gestão de Vínculos"** ainda está disponível no menu lateral e serve como um painel de visualização e edição rápida. Nela, você pode:
- Visualizar rapidamente quais estudantes estão associados a cada cuidador e responsável.
- Identificar estudantes que ainda não possuem um cuidador ou responsável atribuído.
- Clicar em "Editar" para ajustar os vínculos de um usuário específico.

---

## 3. ❤️ Painel do Responsável

Como responsável, você tem acesso a um painel focado na privacidade e no acompanhamento do(s) seu(s) filho(s).

### Visualizando Informações

Ao fazer login, você verá uma lista dos estudantes vinculados ao seu perfil. Para cada estudante, você pode consultar:
- **Nome Completo**
- **Turma** e **Ano Escolar**
- **Status** (ativo, inativo, etc.)
- **Diagnóstico** e **Necessidades Especiais**

O acesso é restrito apenas aos dados dos seus dependentes, garantindo total segurança e privacidade.

---

## 4. 🤝 Painel do Cuidador

O painel do cuidador foi projetado para focar nas suas atividades diárias e no acompanhamento dos estudantes sob sua responsabilidade.

### Meus Estudantes

A tela principal exibe uma lista clara de todos os estudantes que foram atribuídos a você pelo gestor.

### Agenda Diária e Observações (Funcionalidades Futuras)

Em breve, você terá acesso a:
- **Agenda Diária:** Para visualizar as atividades programadas para cada estudante.
- **Registro de Observações:** Uma ferramenta para anotar o progresso, ocorrências e informações importantes do dia a dia, facilitando a comunicação com a equipe e a família.

---

## 5. Suporte

Caso encontre qualquer problema ou tenha alguma dúvida, entre em contato com o administrador do sistema na sua instituição.