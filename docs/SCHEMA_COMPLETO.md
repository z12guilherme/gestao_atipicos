# Dicionário de Dados e Schema Completo (Gestão Atípicos)

Este documento detalha a estrutura relacional completa (Tabelas e Colunas) do banco de dados em PostgreSQL hospedado no Supabase, refletindo a versão final de produção (2026).

---

## 1. Módulo Core (Usuários e Estudantes)

### Tabela: `profiles`
Armazena os usuários do sistema, vinculada ao `auth.users` do Supabase.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Chave Primária (Relaciona com `auth.users.id`). |
| `name` | `text` | Nome completo do usuário. |
| `email` | `text` | E-mail de login. |
| `role` | `role_enum` | Perfil (`gestor`, `cuidador`, `responsavel`). |
| `cpf` | `text` | Documento (Opcional). |
| `phone` | `text` | Telefone de contato (Opcional). |

### Tabela: `students`
Dados pessoais e clínicos dos alunos.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Chave Primária. |
| `name` | `text` | Nome do aluno. |
| `birth_date` | `date` | Data de nascimento. |
| `status` | `status_enum` | Status (`ativo`, `inativo`, `aguardando`). |
| `class_name` | `text` | Turma do aluno. |
| `diagnosis` | `text` | CID / Diagnóstico. |
| `medical_info` | `text` | Observações médicas em geral. |

### Tabelas de Vínculo (N:N)
#### `guardians_students` (Responsáveis Familiares)
| Coluna | Tipo | Descrição |
|---|---|---|
| `guardian_id` | `uuid` (PK/FK) | Referência a `profiles.id`. |
| `student_id` | `uuid` (PK/FK) | Referência a `students.id`. |
| `relationship` | `text` | Grau de parentesco (Ex: Pai, Mãe, Avó). |

#### `caregivers_students` (Profissionais Cuidadores)
| Coluna | Tipo | Descrição |
|---|---|---|
| `caregiver_id`| `uuid` (PK/FK) | Referência a `profiles.id`. |
| `student_id` | `uuid` (PK/FK) | Referência a `students.id`. |

---

## 2. Módulo de Segurança e Portaria

### Tabela: `student_checkins`
Controle de Entrada e Saída da escola.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `checked_by_id` | `uuid` (FK) | Quem registrou (Porteiro/Gestor). |
| `checkin_time`| `timestamp` | Horário de Entrada. |
| `checkout_time`| `timestamp` | Horário de Saída. |

### Tabela: `authorized_persons`
Pessoas autorizadas a buscar a criança.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `name` | `text` | Nome da pessoa autorizada. |
| `relation` | `text` | Parentesco / Vínculo. |

### Tabela: `incidents`
Log de ocorrências e incidentes (Acidentes, crises).
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `reporter_id` | `uuid` (FK) | Quem reportou o incidente. |
| `severity` | `text` | Ex: Baixa, Média, Alta (Urgência SOS). |
| `description` | `text` | Descrição do ocorrido. |

---

## 3. Módulo PDI e Evolução

### Tabela: `pdi_goals`
Metas do Plano de Desenvolvimento Individual.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `title` | `text` | Descrição da Meta. |
| `status` | `text` | Ex: Concluído, Em Andamento. |
| `progress` | `integer` | Porcentagem (0 a 100). |
| `semester` | `text` | Ex: 2026.1, 2026.2. |

### Tabela: `anecdotal_records` (Diário de Bordo)
Registros multidisciplinares (Psicologia, TO, Pedagogia).
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `author_id` | `uuid` (FK) | Autor do registro. |
| `content` | `text` | Corpo do relatório. |
| `record_date` | `date` | Data da observação. |

### Tabela: `student_triggers`
Mapeamento de gatilhos emocionais/comportamentais.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `trigger_name`| `text` | Ex: "Barulho Alto". |
| `description` | `text` | Explicação de como o aluno reage. |

### Tabela: `student_achievements`
Sistema de Gamificação / Conquistas.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `badge_name` | `text` | Nome da conquista (Ex: "Foco Total"). |
| `unlocked_at` | `timestamp` | Quando foi desbloqueada. |

---

## 4. Módulo Diário de Saúde

### Tabela: `daily_health_logs`
Rotina de saúde geral.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `log_date` | `date` | Data do log. |
| `sleep_quality` | `text` | Qualidade do sono da noite anterior. |
| `eating_quality`| `text` | Qualidade da alimentação escolar. |

### Tabela: `medications`
Remédios e prescrições.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `student_id` | `uuid` (FK) | Referência a `students.id`. |
| `med_name` | `text` | Nome do medicamento. |
| `dosage` | `text` | Dosagem. |
| `schedule_time` | `time` | Horário de administração. |
| `requires_notification` | `boolean` | Notificar pais via app. |

### Tabela: `medication_logs`
Histórico e comprovação de que o remédio foi dado.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `medication_id` | `uuid` (FK)| Referência a `medications.id`. |
| `given_by` | `uuid` (FK) | Profissional que ministrou. |
| `given_at` | `timestamp` | Horário exato que foi dado. |

---

## 5. Módulo de Comunicação

### Tabela: `messages`
Chat seguro entre escola e família.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `sender_id` | `uuid` (FK) | Autor da mensagem. |
| `receiver_id` | `uuid` (FK) | Destinatário da mensagem. |
| `content` | `text` | Mensagem criptografada (SSL/TLS). |
| `created_at` | `timestamp` | Data/Hora de envio. |

### Tabela: `announcements`
Mural de recados oficiais.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `author_id` | `uuid` (FK) | Gestor responsável. |
| `title` | `text` | Assunto do aviso. |
| `content` | `text` | Descrição do aviso. |
| `requires_signature`| `boolean` | Necessita "ciente" dos pais. |

### Tabela: `materials`
Materiais de apoio pedagógico (Laudos, PDFs, Vídeos).
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `title` | `text` | Título do material. |
| `type` | `text` | `pdf` ou `video`. |
| `url` | `text` | Caminho no Supabase Storage. |

### Tabela: `meetings`
Reuniões de alinhamento com a família.
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | Identificador. |
| `title` | `text` | Título da reunião (Ex: Alinhamento PDI). |
| `participants` | `text` | Lista de pessoas (Ex: TO, Fono, Pais). |
| `scheduled_at` | `timestamp` | Data e Horário da reunião. |
| `status` | `text` | Confirmada, Cancelada. |
