import { Router } from 'express';
import { authRequired, requireRole } from "../middleware/auth.middleware";
import {
  listarAgendamentos,
  buscarAgendamento,
  listarAgendamentosPorUsuario,
  criarAgendamento,
  removerAgendamento,
  editarAgendamento
} from '../controllers/agendamentos.controller';

const router = Router();

// Listagens: qualquer usuário autenticado
router.get('/all', authRequired, listarAgendamentos);
router.get('/user/:id_usuario', authRequired, listarAgendamentosPorUsuario);
router.get('/:id', authRequired, buscarAgendamento);

// Escrita: restringe por cargo
router.post(
  '/new',
  authRequired,
  requireRole(['Coordenador', 'Auxiliar_Docente', 'Professor']),
  criarAgendamento
);

router.post(
  '/update/:id',
  authRequired,
  requireRole(['Coordenador', 'Auxiliar_Docente', 'Professor']),
  editarAgendamento
);

router.post(
  '/delete/:id',
  authRequired,
  requireRole(['Coordenador', 'Auxiliar_Docente', 'Professor']),
  removerAgendamento
);

export default router;