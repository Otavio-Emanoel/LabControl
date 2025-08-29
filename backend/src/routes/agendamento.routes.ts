import { Router, Request, Response } from 'express';
import { authRequired } from "../middleware/auth.middleware";
import { todosAgendamentos, agendamentoPorId, agendamentosPorUsuario, cadastrarAgendamento, deletarAgendamento, atualizarAgendamento } from '../controllers/agendamentos.controller';
import { getUser } from '../controllers/getUser.controller';

const router = Router();

router.get('/all', authRequired, async (req: Request, res: Response) => {
  try {
    const agendamentos = await todosAgendamentos();
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos', details: error instanceof Error ? error.message : error });
  }
});

router.get('/:id', authRequired, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const agendamento = await agendamentoPorId(id);
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamento', details: error instanceof Error ? error.message : error });
  }
});

router.get("/user/:id_usuario", authRequired, async (req: Request, res: Response) => {
  const id_usuario = Number(req.params.id_usuario);
  try {
    const agendamentos = await agendamentosPorUsuario(id_usuario);
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos do usuário', details: error instanceof Error ? error.message : error });
  }
});

router.post('/new', authRequired, async (req: Request, res: Response) => {
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

router.post("/delete/:id", authRequired, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = getUser(req);
  try {
    const result = await deletarAgendamento(id,user);
    res.json(result);
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro ao deletar agendamento', details: error instanceof Error ? error.message : error });
  }
});

router.post("/update/:id", authRequired, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = getUser(req);
  const { horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario }: {
    horario: string;
    dia: string;
    fk_aulas: number;
    justificativa: string;
    fk_laboratorio: number;
    fk_usuario: number;
    } = req.body;
  try {
    const result = await atualizarAgendamento(id,user,{horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario});
    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento', details: error instanceof Error ? error.message : error });
  }
});

export default router;
