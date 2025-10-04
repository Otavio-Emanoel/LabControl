import { Router } from 'express';
import { adicionarCurso, adicionarDisciplina, listarCursos, listarDisciplinas, listarProfessoresDisciplinas, login, register, vincularProfessorDisciplina, listarProfessores, desvincularProfessorDisciplina } from '../controllers/user.controller';
import { authRequired, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);

// Somente o Auxiliar Docente pode registrar novos usuários
router.post('/register', register);

// Somente o Auxiliar Docente pode adicionar cursos
router.post('/curso', authRequired, requireRole('Auxiliar_Docente'), adicionarCurso);

// Somente Coordenador ou Auxiliar Docente podem adicionar disciplinas
router.post('/disciplina', authRequired, requireRole(['Coordenador', 'Auxiliar_Docente']), adicionarDisciplina);

// Somente Coordenador ou Auxiliar Docente podem vincular professor a disciplina
router.post('/professor-disciplina', authRequired, requireRole(['Coordenador', 'Auxiliar_Docente']), vincularProfessorDisciplina);

// Listar cursos
router.get('/cursos', listarCursos);

// Listar disciplinas
router.get('/disciplinas', listarDisciplinas);

// Listar professores e suas disciplinas
router.get('/professores-disciplinas', listarProfessoresDisciplinas);

// Listar professores (apenas cargo Professor)
router.get('/professores', listarProfessores);

// Desvincular professor de disciplina (Coord/Aux)
router.post('/professor-disciplina/remove', authRequired, requireRole(['Coordenador', 'Auxiliar_Docente']), desvincularProfessorDisciplina);

// Exemplo de rota protegida simples
router.get('/me', authRequired, (req, res) => {
  res.json({ user: (req as any).user });
});

// Rota de ping para checar status do servidor
router.get('/ping', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

export default router;
