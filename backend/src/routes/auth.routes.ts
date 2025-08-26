import { Router } from 'express';
import { login } from '../controllers/user.controller';
import { authRequired } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);

// Exemplo de rota protegida simples
router.get('/me', authRequired, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;
