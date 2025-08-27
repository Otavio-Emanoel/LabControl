import { Router, Request, Response } from 'express';
import todosAgendamentos from '../controllers/agendamentos.controller';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const agendamentos = await todosAgendamentos();
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos', details: error instanceof Error ? error.message : error });
  }
});

export default router;
