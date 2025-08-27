import { Router, Request, Response } from 'express';
import todosHorariosFixos from '../controllers/horariosFixos.controller';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const horarios_fixos = await todosHorariosFixos();
    res.json(horarios_fixos);
  } catch (error) {
    console.error('Erro ao buscar horarios_fixos:', error);
    res.status(500).json({ error: 'Erro ao buscar horarios_fixos', details: error instanceof Error ? error.message : error });
  }
});

export default router;
