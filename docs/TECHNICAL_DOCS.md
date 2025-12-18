# Documentação Técnica Completa - Gestão Atípicos

## Sumário Executivo
Este documento consolida as especificações técnicas, arquiteturais e de segurança do sistema **Gestão Atípicos**. O projeto foi desenvolvido para atender à demanda de gestão eficiente e segura de estudantes com necessidades especiais (atípicos) em redes de ensino, com foco estrito na Lei Geral de Proteção de Dados (LGPD) e em práticas modernas de Engenharia de Software.

---

## 1. Introdução e Contextualização

### 1.1. O Problema
A gestão de cuidados para estudantes atípicos envolve múltiplos atores: gestores escolares, cuidadores profissionais e responsáveis legais. Frequentemente, a comunicação é fragmentada, o registro de atividades é manual (papel) e há riscos elevados de vazamento de dados sensíveis de saúde e rotina.

### 1.2. A Solução
O **Gestão Atípicos** é uma plataforma centralizada que digitaliza o fluxo de acompanhamento. O sistema permite:
- Cadastro unificado de estudantes e suas necessidades específicas.
- Vinculação segura entre estudantes, cuidadores e responsáveis.
- Monitoramento em tempo real via Dashboards.
- Auditoria e controle de acesso granular.

### 1.3. Justificativa Tecnológica e Social
O projeto utiliza uma arquitetura de baixo custo e alta escalabilidade (*Serverless*), viabilizando sua adoção por prefeituras e instituições com recursos limitados, sem comprometer a segurança ou a performance.

---

## 2. Arquitetura de Software

O sistema adota uma arquitetura **Serverless** e **Event-Driven** baseada em nuvem.

### 2.1. Diagrama de Arquitetura

![Diagrama de Arquitetura do Sistema Gestão Atípicos](./img/arquitetura.png)

*Diagrama de arquitetura de alto nível, ilustrando o fluxo de dados desde o usuário final até a camada de persistência e serviços de backend.*

## 3. Stack Tecnológica

A seleção tecnológica priorizou performance, tipagem estática e segurança.

### Frontend
- **Linguagem:** TypeScript (garantia de integridade de código).
- **Framework:** React 18 + Vite (Build tool de alta performance).
- **Gerenciamento de Estado:** TanStack Query (React Query) para cache, sincronização e atualização de estado do servidor.
- **Interface (UI):** Shadcn/UI + Tailwind CSS (Design System moderno, acessível e responsivo).
- **Visualização de Dados:** Recharts para dashboards analíticos.
- **Validação de Formulários:** React Hook Form + Zod (Schema Validation).

### Backend & Infraestrutura
- **Database:** PostgreSQL (Relacional, robusto e ACID compliant).
- **Autenticação:** Supabase Auth (Gerenciamento de sessão via JWT seguro).
- **Hospedagem Frontend:** Vercel (CI/CD integrado).
- **Infraestrutura de Backend:** Supabase (AWS Wrapper).

## 4. Segurança e Conformidade (Security & Compliance)

A segurança foi desenhada seguindo o princípio de *Security by Design*.

### 4.1. Controle de Acesso (RBAC & RLS)
O sistema implementa **Row Level Security (RLS)** diretamente no banco de dados. Isso significa que as regras de acesso não dependem apenas da aplicação, mas são garantidas pelo motor do banco de dados.
- Um *Cuidador* só pode ler dados dos alunos aos quais está vinculado.
- Um *Responsável* só acessa dados do seu próprio tutelado.
- Apenas *Gestores* possuem permissões de escrita global.

### 4.2. Proteção de Dados (LGPD)
- **Minimização de Dados:** Coleta-se apenas o estritamente necessário para a prestação do serviço.
- **Criptografia:** Dados sensíveis trafegam exclusivamente via HTTPS (TLS 1.3). Senhas são armazenadas com hash (Bcrypt/Argon2).
- **Sanitização de Inputs:** O uso da biblioteca `Zod` previne ataques de injeção (XSS/SQL Injection) ao validar rigorosamente todos os dados de entrada antes de processá-los.

### 4.3. Testes de Segurança Realizados
- **Autenticação:** Testes de fluxo de recuperação de senha (Magic Links/Tokens) validados contra interceptação.
- **Autorização:** Testes de penetração horizontal (um usuário tentando acessar dados de outro usuário de mesmo nível) bloqueados pelas políticas de RLS.
- **Validação de Sessão:** Implementação de expiração de tokens e renovação segura (Refresh Tokens).

## 5. Gestão de Vínculos e Controle de Acesso (RBAC & RLS)

Este capítulo detalha a implementação do controle de acesso baseado em papéis (RBAC) e como a arquitetura de vínculos garante a privacidade dos dados através de Row Level Security (RLS).

### 5.1. Matriz de Permissões (RBAC)

O sistema define três perfis principais de acesso, cada um com escopo de visão e ação delimitados:

| Perfil | Escopo de Dados | Permissões de Leitura | Permissões de Escrita |
| :--- | :--- | :--- | :--- |
| **Gestor** | Global (Institucional) | Todos os alunos, usuários, turmas e relatórios. | CRUD total em todas as entidades. |
| **Cuidador** | Restrito (Atribuição) | Apenas dados dos estudantes aos quais está formalmente vinculado na tabela `caregivers_students`. | Inserir observações diárias para seus estudantes. |
| **Responsável** | Restrito (Familiar) | Apenas dados dos estudantes (filhos/tutelados) aos quais está vinculado na tabela `guardians_students`. | Leitura de relatórios e dados do estudante. |

### 5.2. Arquitetura de Vínculos

A "Gestão de Vínculos" é o mecanismo lógico que conecta usuários a estudantes. Diferente de sistemas tradicionais onde a permissão é dada por "grupo", aqui a permissão é dada por "relacionamento".

#### 5.2.1. Modelagem Relacional
O banco de dados utiliza tabelas associativas (junction tables) para criar relações N:N (Muitos-para-Muitos) entre a tabela `profiles` e a tabela `students`.

*   **`guardians_students`**: Associa um perfil de Responsável a um Estudante.
    *   `guardian_id` (FK -> profiles.id)
    *   `student_id` (FK -> students.id)
*   **`caregivers_students`**: Associa um perfil de Cuidador a um Estudante.
    *   `caregiver_id` (FK -> profiles.id)
    *   `student_id` (FK -> students.id)

#### 5.2.2. Fluxo de Atribuição
1.  O **Gestor** acessa o módulo de gestão de estudantes.
2.  Ao criar ou editar um estudante, o Gestor seleciona usuários com role `cuidador` ou `responsavel`.
3.  O sistema insere registros nas tabelas associativas correspondentes.
4.  Imediatamente, as políticas de RLS entram em vigor para os usuários vinculados.

### 5.3. Implementação de Row Level Security (RLS)

A segurança é aplicada na camada de dados (PostgreSQL), garantindo que nenhuma consulta SQL possa vazar dados, independentemente de onde venha a requisição (Frontend, API, etc.).

#### Exemplo de Política RLS (Pseudocódigo SQL)

Para a tabela `students`, a política de leitura (`SELECT`) é definida logicamente como:

```sql
CREATE POLICY "Estudantes são visíveis por seus cuidadores e responsáveis"
ON students
FOR SELECT
USING (
  -- 1. Gestores veem tudo
  (auth.jwt() ->> 'role' = 'gestor')
  OR
  -- 2. Responsáveis veem seus filhos
  (id IN (SELECT student_id FROM guardians_students WHERE guardian_id = auth.uid()))
  OR
  -- 3. Cuidadores veem seus pacientes
  (id IN (SELECT student_id FROM caregivers_students WHERE caregiver_id = auth.uid()))
);
```

Esta abordagem garante o princípio do **Privilégio Mínimo**, onde cada usuário acessa estritamente o necessário para sua função.

## 6. Modelagem de Dados (DER)

A estrutura de dados foi projetada para ser relacional e segura, utilizando o PostgreSQL do Supabase. A seguir, o Diagrama Entidade-Relacionamento (DER) e a descrição detalhada de cada tabela.

### 6.1. Diagrama Entidade-Relacionamento

![Diagrama do Banco de Dados](./img/Diagrama-Banco%20de-Dados.png)

### 6.2. Estrutura Detalhada das Tabelas

Esta seção detalha as colunas, tipos e responsabilidades de cada tabela no banco de dados.

#### Tabela `profiles`
Armazena os dados de perfil de todos os usuários do sistema, vinculados à tabela `auth.users` do Supabase.

| Coluna | Tipo | Chave | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK/FK | Chave primária, referenciando `auth.users.id`. |
| `name` | `text` | | Nome completo do usuário. |
| `email` | `text` | | Email de login do usuário, sincronizado com `auth.users`. |
| `role` | `role_enum` | | Perfil do usuário (`gestor`, `cuidador`, `responsavel`). |
| `cpf` | `text` | | CPF do usuário (opcional). |
| `phone` | `text` | | Telefone de contato (opcional). |
| `function_title`| `text` | | Cargo ou função, relevante para cuidadores (opcional). |
| `work_schedule`| `text` | | Horário de trabalho, relevante para cuidadores (opcional). |

#### Tabela `students`
Contém todas as informações sobre os estudantes atípicos.

| Coluna | Tipo | Chave | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | Identificador único do estudante. |
| `name` | `text` | | Nome completo do estudante. |
| `birth_date` | `date` | | Data de nascimento. |
| `status` | `status_enum`| | Status do estudante (`ativo`, `inativo`, `aguardando`). |
| `class_name` | `text` | | Nome da turma do estudante (campo de texto livre, opcional). |
| `period` | `period_enum`| | Período de estudo (`Manhã`, `Tarde`, `Integral`, opcional). |
| `diagnosis` | `text` | | Diagnóstico ou laudo principal (opcional). |
| `medical_info` | `text` | | Informações médicas relevantes (alergias, medicações, etc., opcional). |

#### Tabela `classes`
Armazena os nomes das turmas existentes para sugestão e organização.

| Coluna | Tipo | Chave | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | Identificador único da turma. |
| `name` | `text` | | Nome da turma (ex: "Turma A - Matutino"). |

*Observação: Atualmente, não há uma chave estrangeira (foreign key) forçando o vínculo entre `students.class_name` e `classes.name` para maior flexibilidade administrativa.*

#### Tabela `caregivers_students` (Tabela de Junção)
Tabela associativa (N-para-N) que vincula cuidadores a estudantes.

| Coluna | Tipo | Chave | Descrição |
| :--- | :--- | :--- | :--- |
| `caregiver_id` | `uuid` | PK/FK | Referencia `profiles.id` do cuidador. |
| `student_id` | `uuid` | PK/FK | Referencia `students.id` do estudante. |

#### Tabela `guardians_students` (Tabela de Junção)
Tabela associativa (N-para-N) que vincula responsáveis a estudantes.

| Coluna | Tipo | Chave | Descrição |
| :--- | :--- | :--- | :--- |
| `guardian_id` | `uuid` | PK/FK | Referencia `profiles.id` do responsável. |
| `student_id` | `uuid` | PK/FK | Referencia `students.id` do estudante. |
| `relationship`| `text` | | Tipo de relacionamento (ex: "Responsável", "Mãe"). |

## 7. Funcionalidades e Módulos

### 7.1. Gestão de Vínculos
Módulo crítico que associa Cuidadores e Responsáveis aos Estudantes. Esta lógica garante que as informações de um aluno (como diário de bordo e ocorrências) sejam visíveis apenas para a equipe autorizada.
    
### 7.2. Dashboard Analítico
Visualização de dados agregados para tomada de decisão:
*   Total de alunos e usuários.
*   Distribuição por turmas.
*   Gráficos interativos (Recharts) com suporte a temas (Claro/Escuro).

### 7.3. Importação em Massa
Funcionalidade desenvolvida com *Edge Functions* para processar grandes volumes de dados (CSV/XLSX), permitindo a migração rápida de legados para o novo sistema.

## 8. Qualidade e Testes

*   **Validação de Dados:** O uso de `Zod` impede que dados inválidos (ex: CPF incorreto, datas futuras) cheguem ao banco de dados.
*   **Testes de Integração:** O fluxo de autenticação e recuperação de senha foi validado em ambientes de produção.
*   **Performance:** Otimização de *bundles* via Vite, garantindo carregamento rápido mesmo em redes móveis (3G).

## 9. Metodologia de Desenvolvimento

O projeto seguiu metodologias ágeis com entregas incrementais:
1.  **Levantamento de Requisitos:** Análise das necessidades das prefeituras e escolas.
2.  **Prototipagem:** Definição de interfaces focadas em UX (Experiência do Usuário).
3.  **Desenvolvimento Iterativo:** Ciclos de codificação, testes e feedback.
4.  **Deploy Contínuo (CI/CD):** Cada alteração no código fonte (GitHub) dispara automaticamente pipelines de build e deploy na Vercel, garantindo que a versão em produção esteja sempre atualizada.

## 10. Diferenciais Técnicos

- **Performance:** O uso de *Code Splitting* e *Lazy Loading* garante que o sistema carregue instantaneamente, mesmo em conexões móveis (3G/4G).
- **Modo Escuro (Dark Mode):** Suporte nativo para conforto visual e economia de energia, respeitando as preferências do sistema operacional do usuário.
- **Importação em Massa:** Funcionalidade otimizada via *Edge Functions* para processar grandes volumes de dados (planilhas de alunos/usuários) sem travar a interface.

## 11. Conclusão

O **Gestão Atípicos** representa uma solução madura, segura e escalável. Sua arquitetura moderna reduz custos operacionais para a administração pública, enquanto suas rigorosas políticas de segurança garantem a proteção dos dados sensíveis dos cidadãos, em total conformidade com a legislação vigente.

---
*Documentação gerada automaticamente para fins de auditoria e apresentação técnica.*