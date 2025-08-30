import { Router } from 'express';
import { adicionarCurso, adicionarDisciplina, login, register, vincularProfessorDisciplina } from '../controllers/user.controller';
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

// Exemplo de rota protegida simples
router.get('/me', authRequired, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;
