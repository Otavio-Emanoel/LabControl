import { Router, Request, Response } from 'express';
import todosHorariosFixos, { deletarHorarioFixo, criarHorarioFixo } from '../controllers/horariosFixos.controller';
import { authRequired, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authRequired, async (req: Request, res: Response) => {
  try {
    const horarios_fixos = await todosHorariosFixos();
    res.json(horarios_fixos);
  } catch (error) {
    console.error('Erro ao buscar horarios_fixos:', error);
    res.status(500).json({ error: 'Erro ao buscar horarios_fixos', details: error instanceof Error ? error.message : error });
  }
});

router.post('/', authRequired, requireRole(['Coordenador','Auxiliar_Docente']), criarHorarioFixo);

router.delete('/:id', authRequired, requireRole(['Coordenador','Auxiliar_Docente']), deletarHorarioFixo);

export default router;
