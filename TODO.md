# TODO - Retomada do Projeto

---

## ✅ Bug Resolvido (Retomada - 2024)

**Problema:** O Painel do Responsável não exibia o estudante vinculado, mesmo que o vínculo existisse no banco de dados.

### Detalhes do Problema

- **Sintoma:** Ao fazer login como `responsavel`, o painel principal (`ResponsavelDashboard`) mostra a mensagem "Nenhum filho cadastrado".
- **Confirmação do Vínculo:** No entanto, para o mesmo usuário, a aba `/students` (Gerenciar Estudantes) **exibe corretamente** o estudante vinculado.
- **Diagnóstico:** O problema residia no hook **`useGuardianData.tsx`**. A consulta de dados para o painel era muito complexa, pois tentava buscar dados aninhados (estudantes e seus relatórios) em uma única requisição. Essa complexidade, ao interagir com as políticas de RLS (Row Level Security), fazia a consulta falhar silenciosamente e retornar uma lista vazia.

### Solução Aplicada

1.  **Simplificação da Consulta Principal:** O hook `useGuardianData.tsx` foi refatorado para usar uma consulta mais simples e robusta, buscando **apenas os estudantes** vinculados, sem tentar aninhar os relatórios.
    ```javascript
    // Em useGuardianData.tsx (agora simplificado)
    .from('guardians_students')
    .select('students(*)') // Apenas busca os estudantes.
    .eq('guardian_id', profile.id);
    ```
2.  **Busca de Dados Separada:** A responsabilidade de buscar os relatórios foi movida para dentro do componente `StudentCard`. Foi criado um novo hook, `useStudentReports(studentId)`, que é chamado para cada estudante individualmente.
3.  **Resiliência do Componente:** Essa abordagem tornou o `ResponsavelDashboard.tsx` mais resiliente. A lista de estudantes carrega primeiro, e os relatórios de cada um são carregados em seguida, de forma independente. Se a busca de relatórios de um estudante falhar, não impede que os outros sejam exibidos.

O bug foi corrigido e o painel do responsável agora funciona como esperado.

---

## Contexto do Problema

**PROBLEMA RESOLVIDO:** Ao tentar criar um novo "Cuidador" ou importar usuários em massa a partir da interface web, um erro de **CORS (Cross-Origin Resource Sharing)** era disparado pelo navegador.

- **O que acontece?** A aplicação frontend (rodando em `localhost` ou `127.0.0.1`) tenta fazer uma requisição do tipo `POST` para a Edge Function `create-user` no Supabase. Antes da requisição `POST` real, o navegador envia uma requisição de "pre-flight" do tipo `OPTIONS` para verificar se o servidor permite a comunicação a partir da origem do frontend.
- **Causa do Erro:** A Edge Function não estava configurada para responder a essa requisição `OPTIONS` com os cabeçalhos CORS apropriados (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.). Como resultado, o navegador bloqueia a requisição `POST` subsequente por segurança.
- **Solução Aplicada:** O arquivo `supabase/functions/create-user/index.ts` foi modificado para:
  1.  Interceptar requisições `OPTIONS`.
  2.  Responder a elas com os cabeçalhos CORS necessários, permitindo requisições de qualquer origem (`*`) e os métodos `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
  3.  Adicionar os mesmos cabeçalhos a todas as outras respostas (`POST`, etc.) para garantir consistência.

---

## ✅ Progresso Realizado | 06/10/2025

A funcionalidade de criação de usuários, que era o último ponto pendente, foi finalizada e validada.

1.  **Correção do CORS:** O código da Edge Function `create-user` foi verificado e ajustado para lidar com requisições `OPTIONS`.
2.  **Deploy da Função:** A função foi implantada com sucesso no ambiente do Supabase.
3.  **Teste da Funcionalidade:** A criação de novos usuários e a importação em massa foram testadas na interface web. O erro de CORS foi resolvido e os usuários são criados corretamente no banco de dados.

Com isso, todas as funcionalidades planejadas para a versão inicial estão completas.

## 🚀 Próximos Passos (Pós-Pausa)

Com a retomada do projeto, o foco pode se voltar para as funcionalidades futuras mencionadas na documentação:

- **[ ] Módulo de Comunicação:** Implementar um mural de recados ou chat para comunicação entre cuidadores e responsáveis.
- **[ ] Registro de Ocorrências e Evolução:** Permitir que cuidadores registrem observações diárias sobre o progresso e comportamento de cada estudante. O painel do responsável (`ResponsavelDashboard.tsx`) já tem a estrutura para exibir esses dados.
- **[ ] Relatórios e Análises:** Criar um módulo para gestores gerarem relatórios personalizados.
- **[ ] Notificações:** Implementar um sistema de notificações (e-mail ou na plataforma) para eventos importantes.
- **[ ] Segurança (Supply Chain):** Substituir dependência `xlsx` por `exceljs` ou `read-excel-file` devido a vulnerabilidades de segurança.