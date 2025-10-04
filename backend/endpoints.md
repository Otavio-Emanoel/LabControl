## Endpoints LabControl

### Autenticação e Usuários

**POST /auth/register**
- Cadastra novo usuário (apenas Auxiliar_Docente)
- Body: `{ nome, email, senha, cargo }`
- Necessário token de Auxiliar_Docente

**POST /auth/login**
- Realiza login
- Body: `{ email, senha }`
- Retorna token JWT

**GET /auth/me**
- Retorna dados do usuário autenticado
- Necessário token

---

### Cursos e Disciplinas

**GET /auth/cursos**
- Lista todos os cursos
- Não requer autenticação

**GET /auth/disciplinas**
- Lista todas as disciplinas
- Não requer autenticação

**GET /auth/professores**
- Lista todos os usuários com cargo Professor
- Não requer autenticação

**GET /auth/professores-disciplinas**
- Lista todos os vínculos de professor com disciplina
- Não requer autenticação

**POST /auth/curso**
- Adiciona novo curso (apenas Auxiliar_Docente)
- Body: `{ nome }`
- Necessário token de Auxiliar_Docente

**POST /auth/disciplina**
- Adiciona nova disciplina (Coordenador ou Auxiliar_Docente)
- Body: `{ nome, id_curso }`
- Necessário token de Coordenador ou Auxiliar_Docente

**POST /auth/professor-disciplina**
- Vincula professor à disciplina (Coordenador ou Auxiliar_Docente)
- Body: `{ id_usuario, id_disciplina }`
- Necessário token de Coordenador ou Auxiliar_Docente

**POST /auth/professor-disciplina/remove**
- Desvincula (remove) o vínculo de um professor com uma disciplina (Coordenador ou Auxiliar_Docente)
- Body: `{ id_usuario, id_disciplina }`
- Necessário token de Coordenador ou Auxiliar_Docente

---

### Agendamentos

**POST /agendamentos/new**
- Cria novo agendamento
- Body: `{ horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario }`
- Necessário token do usuário
- Regras:
  - Horário deve ser um dos horários permitidos
  - Não permite datas passadas
  - Se `fk_aulas` for enviado, a disciplina deve existir; se o usuário logado for Professor, ele deve estar vinculado a essa disciplina
  - Impede duplicidade por (fk_laboratorio, dia, horario)
  - Professores só podem agendar com no máximo 14 dias (2 semanas) de antecedência
  - Campo `justificativa` agora é OBRIGATÓRIO e não pode ser vazio

**GET /agendamentos/all**
- Lista todos os agendamentos
- Necessário token
- Retorna também: `fk_aulas` (id_disciplina) e `nome_disciplina` quando houver

**GET /agendamentos/:id**
- Busca agendamento por ID
- Necessário token
- Retorna também: `fk_aulas` (id_disciplina) e `nome_disciplina` quando houver

**GET /agendamentos/usuario/:id_usuario**
- Lista agendamentos de um usuário
- Necessário token
- Retorna também: `fk_aulas` (id_disciplina) e `nome_disciplina` quando houver

**POST /agendamentos/update/:id**
- Atualiza agendamento (todos os campos)
- Body: `{ horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario }`
- Necessário token

**POST /agendamentos/justificativa/:id**
- Atualiza apenas a justificativa do agendamento
- Body: `{ justificativa }`
- Necessário token

**POST /agendamentos/delete/:id**
- Remove agendamento
- Necessário token

**POST /agendamentos/fixo/:id**
- Transforma um agendamento existente em horário fixo (mesmo horário, dia da semana e laboratório)
- Necessário token de Coordenador ou Auxiliar_Docente
- Regras:
  - Usa o `dia` da reserva para calcular o `dia_semana` (domingo..sábado)
  - Impede duplicidade por (fk_lab, dia_semana, horario)
  - Retorna 404 se o agendamento não existir e 409 se já houver horário fixo igual

---

### Horários fixos

**GET /horarios-fixos/**
- Lista todos os horários fixos
- Necessário token

**POST /horarios-fixos/**
- Cria um horário fixo manualmente
- Necessário token de Coordenador ou Auxiliar_Docente
- Body: `{ dia_semana, horario, fk_lab, fk_usuario }`
- Regras:
  - `dia_semana`: domingo, segunda, terca, quarta, quinta, sexta, sabado
  - `horario`: um dos horários permitidos (mesma lista dos agendamentos)
  - `fk_usuario` deve ser um Professor
  - Impede duplicidade por (fk_lab, dia_semana, horario)

**DELETE /horarios-fixos/:id**
- Remove um horário fixo por ID
- Necessário token de Coordenador ou Auxiliar_Docente
- Retorna 404 se não existir

---

### Notificações

Geração automática:
- Diário: quando um Professor realiza o 3º agendamento no mesmo dia (excedendo 2), é criada/atualizada uma notificação (tipo `LIMITE_AGENDAMENTOS`) para cada usuário com cargo Auxiliar_Docente contendo: professor, data, total no dia e lista dos horários/laboratórios.
- Semanal: quando um Professor atinge 7 agendamentos em uma janela rolante de 7 dias corridos, é criada/atualizada uma notificação (tipo `LIMITE_AGENDAMENTOS_SEMANAL`) para cada usuário com cargo Coordenador (ou Auxiliar_Docente, conforme regra futura) detalhando total semanal e lista resumida.

**GET /notificacoes**
- Lista notificações do usuário autenticado (ordenadas: não lidas primeiro, depois mais recentes)
- Necessário token
- Retorna: `[ { id_notificacao, tipo, titulo, mensagem, lida, data_criacao } ]`

**POST /notificacoes/ler/:id**
- Marca uma notificação específica como lida (apenas se pertencer ao usuário)
- Necessário token
- Retorno: `{ ok: true }` ou 404 se não pertencer/não existir

**POST /notificacoes/ler-todas**
- Marca todas as notificações do usuário como lidas
- Necessário token
- Retorno: `{ ok: true, atualizadas: <quantidade> }`

---

### Outros

**/test/**
- Rotas de teste

---

### Laboratórios

**GET /labs/all**
- Lista todos os laboratórios.
- Retorno: `[ { id_Laboratorio, numero, descricao } ]`

**POST /labs**
- Cria um novo laboratório ou auditório.
- Body: `{ numero, descricao? }`
- Regras:
  - `numero` obrigatório, string não vazia.
  - Sem duplicidade (case-insensitive) de `numero`.
 - Necessário token de `Auxiliar_Docente`.
- Retornos:
  - 201 `{ id_Laboratorio, numero, descricao }`
  - 409 se já existir laboratório com mesmo nome.

**DELETE /labs/:id**
- Remove laboratório pelo ID.
- Regras:
  - Bloqueia remoção se existir reserva vinculada.
 - Necessário token de `Auxiliar_Docente`.
- Retornos:
  - 200 `{ ok: true }`
  - 404 se não encontrado.
  - 409 se em uso.

> Obs.: Acesso às rotas de criação e remoção restrito ao cargo `Auxiliar_Docente`.