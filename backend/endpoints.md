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

---

### Outros

**/test/**
- Rotas de teste