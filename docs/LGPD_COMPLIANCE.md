# ⚖️ Conformidade LGPD (Lei Geral de Proteção de Dados)

**Lei nº 13.709/2018**

O projeto **Gestão Atípicos** foi desenvolvido seguindo os princípios de *Privacy by Design*, visando a conformidade com a LGPD, especialmente no que tange ao tratamento de dados de crianças e adolescentes e dados sensíveis de saúde.

---

## 1. Agentes de Tratamento

- **Controlador:** A Instituição de Ensino (Escola) que utiliza o software. É quem decide "o que" fazer com os dados.
- **Operador:** A plataforma Gestão Atípicos (desenvolvedores/mantenedores). É quem processa os dados em nome da escola.
- **Encarregado (DPO):** Deve ser nomeado pela Instituição de Ensino.

## 2. Tipos de Dados Coletados

A plataforma coleta e armazena as seguintes categorias de dados:

1.  **Dados Pessoais (Art. 5º, I):**
    -   Nome, e-mail, telefone, CPF (Gestores, Cuidadores, Responsáveis).
2.  **Dados Pessoais Sensíveis (Art. 5º, II):**
    -   Dados referentes à saúde, diagnósticos, laudos médicos e vida sexual (no contexto de desenvolvimento) dos estudantes.
3.  **Dados de Crianças e Adolescentes (Art. 14):**
    -   O tratamento é realizado no **melhor interesse** da criança/adolescente.

## 3. Base Legal para o Tratamento

O tratamento de dados na plataforma baseia-se principalmente em:

-   **Consentimento Específico e em Destaque (Art. 14, § 1º):** Deve ser coletado pela Escola junto a pelo menos um dos pais ou responsável legal antes do cadastro no sistema.
-   **Tutela da Saúde (Art. 7º, VIII):** Para procedimentos realizados por profissionais de saúde ou assistência social (cuidadores).
-   **Cumprimento de Obrigação Legal (Art. 7º, II):** Obrigações do MEC e legislação educacional.

## 4. Direitos dos Titulares (Art. 18)

A plataforma oferece ferramentas para que a Escola garanta os direitos dos titulares:

-   **Acesso Facilitado:** Responsáveis têm acesso direto aos dados de seus filhos via Painel do Responsável.
-   **Correção de Dados:** Gestores podem corrigir dados incompletos, inexatos ou desatualizados imediatamente.
-   **Eliminação de Dados:** Funcionalidade para exclusão de usuários e estudantes (respeitando prazos legais de guarda de documentos escolares).

## 5. Medidas de Segurança (Art. 46)

Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais:

1.  **Criptografia:** Dados em trânsito (HTTPS/TLS) e banco de dados criptografado em repouso.
2.  **Controle de Acesso (RLS):** Políticas rigorosas no banco de dados garantem que apenas usuários autorizados acessem dados específicos (ex: um pai não vê dados de outro aluno).
3.  **Logs:** Registro de criação de usuários (timestamp).
4.  **Minimização:** Coletamos apenas os dados estritamente necessários para a gestão escolar e o cuidado do aluno.

## 6. Ciclo de Vida dos Dados

1.  **Coleta:** Inserção manual pelo Gestor ou Importação em Massa.
2.  **Processamento:** Armazenamento, estruturação e disponibilização para Cuidadores/Responsáveis.
3.  **Compartilhamento:** Não há compartilhamento de dados com terceiros para fins comerciais/publicitários.
4.  **Descarte:** Após o término do vínculo escolar ou solicitação, os dados podem ser excluídos ou anonimizados, salvo se houver obrigação legal de retenção.

---

## ⚠️ Aviso Importante para a Escola

O uso deste software não garante automaticamente a conformidade com a LGPD. A Escola deve:
1.  Coletar o termo de consentimento dos pais.
2.  Nomear um DPO.
3.  Treinar seus funcionários (ver Política de Segurança).