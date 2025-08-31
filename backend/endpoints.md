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

---

### Agendamentos

**POST /agendamentos/new**
- Cria novo agendamento
- Body: `{ horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario }`
- Necessário token do usuário

**GET /agendamentos/all**
- Lista todos os agendamentos
- Necessário token

**GET /agendamentos/:id**
- Busca agendamento por ID
- Necessário token

**GET /agendamentos/usuario/:id_usuario**
- Lista agendamentos de um usuário
- Necessário token

**POST /agendamentos/update/:id**
- Atualiza agendamento
- Body: `{ horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario }`
- Necessário token

**POST /agendamentos/update/:id**
- Remove agendamento
- Necessário token

---

### Outros

**/test/**
- Rotas de teste