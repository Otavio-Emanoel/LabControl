import { Router, Request, Response } from 'express';
import cadastrarAgendamento from '../controllers/cadastarAgendamento.controller';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario }: {
    horario: string;
    dia: string;
    fk_aulas: number;
    justificativa: string;
    fk_laboratorio: number;
    fk_usuario: number;
    } = req.body;
  try {
    const result = await cadastrarAgendamento({horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario});
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos', details: error instanceof Error ? error.message : error });
  }
});

export default router;
