# 🎬 Roteiros de Apresentação em Vídeo - Gestão Atípicos

Este documento contém os scripts sugeridos para a gravação dos vídeos de demonstração do projeto.

---

## 📹 Vídeo 1: Apresentação Técnica (Engenharia de Software)

**Público-alvo:** Recrutadores, Tech Leads, Desenvolvedores Sênior.
**Tempo Estimado:** 3 a 5 minutos.
**Objetivo:** Demonstrar domínio da stack, arquitetura segura e boas práticas de código.

### 1. Introdução e Contexto (0:00 - 0:45)
- **[Câmera em você ou Tela Inicial da Aplicação]**
- "Olá, sou Marcos Guilherme. Apresento o **Gestão Atípicos**, uma plataforma SaaS multi-tenant desenvolvida para otimizar o acompanhamento de estudantes com necessidades especiais."
- "O objetivo técnico foi criar uma solução escalável, segura e em conformidade com a LGPD, resolvendo o problema da fragmentação de dados sensíveis em escolas."
- "A stack utilizada foi **React com Vite e TypeScript** no frontend, garantindo tipagem estática rigorosa, e **Supabase** no backend, utilizando todo o ecossistema: Auth, Database, Storage e Edge Functions."

### 2. Arquitetura e Segurança (O Diferencial) (0:45 - 2:00)
- **[Mostrar Diagrama do Banco de Dados ou Código SQL das Policies]**
- "A segurança é o pilar central deste projeto. Implementei uma arquitetura baseada em **Row Level Security (RLS)**. Isso significa que a regra de negócio de 'quem vê o quê' está no banco de dados, não apenas no frontend."
- "Por exemplo, um *Responsável* jamais conseguirá acessar dados de um aluno que não seja seu filho, mesmo que tente manipular a API, pois o banco bloqueia a query."
- **[Mostrar código da Edge Function `upsert-student`]**
- "Para operações críticas, como o cadastro de estudantes e seus vínculos, utilizei **Supabase Edge Functions** com Deno. Isso me permitiu criar transações atômicas: ou salvamos o aluno e todos os seus vínculos (cuidadores/pais), ou revertemos tudo. Além disso, contornamos limitações de RLS usando a `Service Role` de forma controlada apenas no servidor."

### 3. Observabilidade e Defesa Ativa (2:00 - 3:00)
- **[Mostrar repositório do SIEM ou Logs]**
- "Implementei um sistema de **SIEM** próprio para monitoramento de segurança."
- "O projeto conta com **Honeytokens** (credenciais isca) e **Canary Endpoints**. Se um atacante tentar usar uma chave vazada ou acessar uma rota administrativa falsa, o sistema detecta, loga o incidente com um `Correlation ID` e alerta a equipe. Isso eleva o nível de maturidade de segurança da aplicação."

### 4. Funcionalidades Complexas e UX (3:00 - 4:00)
- **[Mostrar a tela de Importação em Massa]**
- "No frontend, destaque para a importação em massa. Substituí a biblioteca `xlsx` por `exceljs` para mitigar vulnerabilidades de Supply Chain."
- **[Mostrar o Visualizador de PDF]**
- "Implementei também o gerenciamento de documentos. Os laudos médicos são armazenados em buckets privados. Para visualização, geramos **Signed URLs** temporárias, exibindo o PDF em um modal seguro sem expor o link público."

### 5. Conclusão (4:00 - Fim)
- **[Voltar para a câmera ou Dashboard]**
- "O Gestão Atípicos não é apenas um CRUD; é uma aplicação robusta, com arquitetura pensada em segurança, performance e manutenibilidade. O código está disponível no meu GitHub. Obrigado!"

---

## 📹 Vídeo 2: Apresentação de Produto (Comercial/Usuário)

**Público-alvo:** Diretores de escola, Coordenadores Pedagógicos, Pais.
**Tempo Estimado:** 2 a 3 minutos.
**Objetivo:** Vender a solução, mostrando facilidade de uso e valor agregado.

### 1. O Problema e a Solução (0:00 - 0:30)
- **[Tela: Login da Aplicação]**
- "Sabemos como é difícil gerenciar a comunicação e os documentos de estudantes atípicos. Papéis se perdem, informações ficam desencontradas."
- "O **Gestão Atípicos** veio para centralizar tudo isso em um ambiente seguro, simples e acessível para a escola e para as famílias."

### 2. A Visão do Gestor (0:30 - 1:15)
- **[Ação: Logar como Gestor]**
- "Como Gestor, você tem a visão completa. Aqui no Dashboard, você acompanha o total de alunos e a equipe."
- **[Ação: Clicar em 'Alunos' > 'Novo Estudante']**
- "Cadastrar um aluno é muito rápido. Você coloca os dados básicos, informações médicas e, o mais importante: **anexa o laudo médico** digitalizado."
- **[Ação: Mostrar upload de PDF e Vínculos]**
- "Aqui mesmo, você já define quem é o Cuidador responsável e quem são os Pais. Tudo conectado em um clique."
- "Precisa cadastrar a escola toda? Use nossa importação via Excel."

### 3. O Apoio ao Cuidador (1:15 - 1:50)
- **[Ação: Logar como Cuidador]**
- "O Cuidador acessa o sistema e vê *apenas* os alunos que ele atende. Foco total no trabalho."
- **[Ação: Clicar no ícone de 'Olho' para ver o Laudo]**
- "Precisa consultar uma informação médica urgente? O laudo está a um clique de distância, seguro e rápido, sem precisar ir até a secretaria procurar pastas físicas."

### 4. A Tranquilidade da Família (1:50 - 2:30)
- **[Ação: Logar como Responsável]**
- "Para os pais, oferecemos transparência. Eles acessam o painel e veem as informações do seu filho, a turma e as observações feitas pela equipe."
- "Tudo isso com total privacidade. Um pai nunca vê dados de outro aluno."

### 5. Fechamento (2:30 - Fim)
- **[Tela: Logo ou Dashboard bonito]**
- "Gestão Atípicos: Tecnologia para incluir, segurança para proteger e facilidade para cuidar. Transforme a gestão da sua escola hoje."

---

## 📝 Checklist de Preparação para Gravação

Antes de começar a gravar, certifique-se de:

1.  **Limpar o Banco de Dados (ou criar dados fictícios bonitos):**
    *   Crie um aluno com nome realista (ex: "Davi Lucca").
    *   Tenha um PDF de teste pronto para upload (nomeie como `laudo_medico.pdf`).
    *   Tenha usuários criados para cada perfil:
        *   `gestor@escola.com`
        *   `cuidador@escola.com`
        *   `pai@familia.com`

2.  **Ambiente:**
    *   Feche abas desnecessárias do navegador.
    *   Coloque o navegador em tela cheia (F11).
    *   Se for gravar o código, aumente a fonte do VS Code (`Ctrl +`).

3.  **Ferramentas Sugeridas:**
    *   **OBS Studio:** Para gravar a tela com alta qualidade.
    *   **Loom:** Para gravar tela + webcam simultaneamente de forma prática.