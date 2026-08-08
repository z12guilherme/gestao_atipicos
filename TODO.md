# 🎯 TODO: Novas Funcionalidades - Gestão Atípicos

Este documento contém um mapeamento extenso de possíveis novas funcionalidades para o sistema **Gestão Atípicos**, com foco especial na **segurança dos alunos**, **tranquilidade dos pais** e **acompanhamento detalhado de desempenho (PDI)**.

---

## 🛡️ 1. Segurança e Monitoramento em Tempo Real

- [x] **Autenticação em Duas Etapas (2FA/MFA):** Camada adicional de segurança no login usando o Google Authenticator para todos os usuários.
- [x] **Alertas de Emergência (SMS/WhatsApp):** Integração com APIs (como Twilio ou Z-API) para disparo automático de mensagens aos pais em caso de emergências de saúde, crises severas ou incidentes de segurança.
- [x] **Controle Rigoroso de Entrada e Saída (Check-in/Check-out):**
  - Registro de chegada e saída do aluno na escola/clínica com notificação imediata no app dos pais.
  - Autenticação via QR Code ou Biometria para a pessoa responsável por buscar a criança.
  - Lista de pessoas autorizadas com foto e exigência de validação de identidade pelo profissional da portaria.
- [x] **Botão de Pânico (SOS) / Central de Incidentes:** Um atalho rápido no perfil do professor/mediador para acionar a coordenação e equipe de apoio médico imediatamente em caso de acidentes ou crises de regulação complexas.
- [x] **Geolocalização do Transporte Escolar:** Integração para que os pais acompanhem em tempo real o trajeto da criança entre a casa e a instituição.
- [x] **Alerta de Omissão/Ausência:** Notificação automática caso o aluno não faça check-in até um horário limite estabelecido, garantindo que os pais saibam rapidamente se a criança não chegou ao destino.
- [x] **Logs de Auditoria de Acessos Sensíveis (SIEM):** Rastrear qual profissional acessou os dados médicos ou o PDI da criança (garantindo adequação à LGPD).

---

## 📊 2. Relatórios de Desempenho e PDI (Plano de Desenvolvimento Individual)

- [x] **Dashboard de Evolução do PDI:** Gráficos interativos mostrando o progresso da criança em habilidades cognitivas, sociais, motoras e de linguagem.
- [x] **Geração Automática de Relatórios (PDF/Excel):** Sistema que compila os dados do mês (notas, observações diárias, marcos atingidos) e gera um boletim humanizado enviado automaticamente por e-mail aos pais.
- [x] **Diário de Bordo Multidisciplinar:** Um espaço onde terapeutas (fonoaudiólogos, T.Os, psicólogos) e professores inserem avaliações unificadas, criando um relatório 360º do aluno.
- [x] **Mapeamento de Gatilhos e Comportamentos:** Ferramenta analítica para cruzar dados (ex: "Sempre que a criança dorme mal na noite anterior, ocorre uma crise de regulação às 10h da manhã"). O sistema pode prever e sugerir adaptações na rotina.
- [x] **Registro de Anedotário Digital:** Notas rápidas, em áudio ou texto, gravadas pelo professor no momento em que um evento importante acontece (uma conquista inesperada, uma reação nova), para compor o relatório final.
- [x] **Mural de Conquistas (Gamificação Positiva):** Um relatório visual e lúdico para os pais celebrarem pequenas vitórias (ex: "Hoje o João conseguiu manter contato visual por mais tempo", "Fez a refeição completa").

---

## 🩺 3. Saúde e Bem-Estar da Criança

- [x] **Gestão e Alertas de Medicação:**
  - Cronograma de medicamentos no painel do professor/enfermeiro.
  - Disparo de aviso automático aos pais assim que a medicação é administrada (com horário exato e profissional responsável).
- [x] **Controle Restrito de Alergias e Seletividade Alimentar:**
  - Alertas visuais fortíssimos (banners vermelhos) no perfil da criança sobre alergias severas.
  - Notificação ao nutricionista/cantina em caso de restrições alimentares específicas do dia.
- [x] **Registro de Sono e Alimentação Diária:** Pais preenchem um formulário rápido de manhã (como a criança dormiu, se comeu bem) para que a escola ajuste as expectativas diárias, e a escola preenche na saída (como foi a alimentação e as idas ao banheiro).

---

## 💬 4. Comunicação e Engajamento Família-Escola

- [x] **Chat Seguro e Monitorado:** Canal direto e oficial entre os pais e a equipe (sem depender de WhatsApp pessoal), com histórico salvo e monitoramento por palavras-chave sensíveis.
- [x] **Central de Agendamento de Reuniões:** Módulo para pais agendarem facilmente reuniões com coordenadores ou mediadores nos horários disponíveis na plataforma.
- [x] **Mural de Recados Institucionais e Enquetes:** Para a escola enviar comunicados gerais, solicitar autorizações de passeios (com assinatura digital) e enquetes sobre a rotina.
- [x] **Central de Materiais e Orientações:** Repositório onde a escola pode compartilhar cartilhas, vídeos educativos e estratégias para os pais continuarem os estímulos do PDI em casa.

---

## ⚙️ 5. Funcionalidades Técnicas & Offline (Robustez)

- [x] **Sincronização Offline-First (Modo Resiliência):** Garantir que professores possam registrar crises, medicar e fazer observações do PDI mesmo se a internet da escola cair, sincronizando imediatamente ao reconectar.
- [x] **Upload de Mídias (Fotos/Vídeos Curtos):** Permitir que o professor anexe vídeos curtos no relatório para provar à família (e aos terapeutas) a evolução de uma habilidade específica.
- [x] **Exportação de Dados Clínicos:** Permitir que os pais exportem um dossiê clínico completo em um clique, caso precisem trocar de especialista médico ou levar para uma consulta de rotina.
