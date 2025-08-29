import { Router } from 'express';
import { login, register } from '../controllers/user.controller';
import { authRequired, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);

// Somente o Auxiliar Docente pode registrar novos usuários
router.post('/register', authRequired, requireRole('Auxiliar_Docente'), register);

// Exemplo de rota protegida simples
router.get('/me', authRequired, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;
