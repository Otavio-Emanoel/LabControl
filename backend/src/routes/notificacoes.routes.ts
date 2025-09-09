import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import { listarNotificacoes, marcarNotificacaoLida, marcarTodasLidas } from '../controllers/notificacoes.controller';

const router = Router();

router.get('/', authRequired, listarNotificacoes);
router.post('/ler/:id', authRequired, marcarNotificacaoLida);
router.post('/ler-todas', authRequired, marcarTodasLidas);

export default router;
