# TODO - Retomada do Projeto

## ⚠️ Motivo da Pausa (Contexto de Hardware)

O desenvolvimento foi pausado principalmente por uma limitação de hardware: **um SSD com pouco espaço de armazenamento**.

Projetos modernos como este, que utilizam **Docker**, o ecossistema **Node.js** (`node_modules`) e diversas ferramentas de build, consomem uma quantidade significativa de espaço em disco. A constante necessidade de limpar caches e imagens Docker para liberar espaço tornou o fluxo de trabalho improdutivo e frustrante.

A decisão de pausar é estratégica, visando um futuro upgrade de hardware (um SSD maior) para permitir um desenvolvimento mais fluido e eficiente.

---

## Visão Geral do Status do Projeto

Para facilitar a retomada, aqui está um resumo do estado atual da aplicação:

#### ✅ Telas e Funcionalidades 100% Funcionais:
- **Autenticação:** Login/Logout para todos os perfis.
- **Painel do Gestor:**
  - Dashboard com estatísticas.
  - Gerenciamento (CRUD) de Usuários (exceto a criação, que é o ponto de parada atual).
  - Gerenciamento (CRUD) de Estudantes.
  - Gerenciamento (CRUD) de Atribuições (vínculo entre cuidador e estudante).
- **Painel do Responsável:** Visualização dos dados dos estudantes vinculados.
- **Painel do Cuidador:** Visualização dos estudantes atribuídos.

---

## Contexto do Problema

Ao tentar criar um novo "Cuidador" ou importar usuários em massa a partir da interface web, um erro de **CORS (Cross-Origin Resource Sharing)** é disparado pelo navegador.

- **O que acontece?** A aplicação frontend (rodando em `localhost` ou `127.0.0.1`) tenta fazer uma requisição do tipo `POST` para a Edge Function `create-user` no Supabase. Antes da requisição `POST` real, o navegador envia uma requisição de "pre-flight" do tipo `OPTIONS` para verificar se o servidor permite a comunicação a partir da origem do frontend.
- **Causa do Erro:** A Edge Function não estava configurada para responder a essa requisição `OPTIONS` com os cabeçalhos CORS apropriados (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.). Como resultado, o navegador bloqueia a requisição `POST` subsequente por segurança.
- **Solução Aplicada (no código):** O arquivo `supabase/functions/create-user/index.ts` foi modificado para:
  1.  Interceptar requisições `OPTIONS`.
  2.  Responder a elas com os cabeçalhos CORS necessários, permitindo requisições de qualquer origem (`*`) e os métodos `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
  3.  Adicionar os mesmos cabeçalhos a todas as outras respostas (`POST`, etc.) para garantir consistência.

## Próximos Passos

**O objetivo imediato é validar a correção do erro de CORS e finalizar a funcionalidade de criação de usuários.**

1.  **Verificar a Correção:** Confirme que o conteúdo do arquivo `supabase/functions/create-user/index.ts` corresponde ao código corrigido que lida com as requisições `OPTIONS` e adiciona os cabeçalhos CORS.

2.  **Fazer o Deploy da Função:**
    - Abra um terminal na pasta raiz do projeto (`gestao_atipicos-main`).
    - Execute o seguinte comando para enviar a função atualizada para o ambiente do Supabase:
    ```bash
    supabase functions deploy create-user --no-verify-jwt
    ```
    - Aguarde a confirmação de que o deploy foi concluído com sucesso.

3.  **Testar a Funcionalidade:**
    - Após o deploy ser concluído com sucesso, volte para a aplicação no navegador.
    - Abra as ferramentas de desenvolvedor (F12) e vá para a aba "Network" (Rede).
    - Tente criar um novo "Cuidador" ou importar um arquivo de usuários.
    - **Verificação:**
      - Observe a requisição `create-user` na aba "Network". Você deverá ver primeiro uma requisição `OPTIONS` com status `200 OK`, seguida pela requisição `POST`.
      - O erro de CORS no console do navegador não deve mais aparecer.
      - A aplicação deve exibir uma notificação de sucesso, e o novo usuário deve aparecer na lista.