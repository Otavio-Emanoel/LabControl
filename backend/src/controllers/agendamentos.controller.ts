import { pool } from "../database/connection";
import { DbAgendamento } from "../models/agendamentos.model";
import { Request, Response } from "express";

const ALLOWED_TIMES = [
  '08:00:00',
  '08:50:00',
  '10:00:00',
  '10:50:00',
  '11:40:00',
  '12:30:00',
  '13:30:00',
  '14:20:00',
  '15:10:00',
];

// cadastrar novo agendamento (função interna)
async function cadastrarAgendamento(
  { horario,
    dia,
    fk_aulas,
    justificativa,
    fk_laboratorio,
    fk_usuario
  }: DbAgendamento) {
  const sql = `
        INSERT INTO reserva (
            horario,
            dia,
            fk_aulas,
            justificativa,
            fk_laboratorio,
            fk_usuario
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;

  const values = [horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario];

  const [result] = await pool.query(sql, values);
  return result;
}

// listar todos os agendamentos (função interna)
async function todosAgendamentos() {
  const query = `
    SELECT 
      r.id_Reserva,
      r.horario,
      r.dia,
      r.justificativa,
      u.id_usuario,
      u.nome AS nome_usuario,
      l.id_Laboratorio,
      l.numero AS numero_laboratorio
    FROM 
      reserva r
    INNER JOIN 
      usuarios u ON r.fk_usuario = u.id_usuario
    INNER JOIN 
      laboratorio l ON r.fk_laboratorio = l.id_Laboratorio
  `;

  const [rows] = await pool.query(query);
  return rows;
}

// Pegar agendamento específico (função interna)
async function agendamentoPorId(id: number) {
  const query = `
    SELECT 
      r.id_Reserva,
      r.horario,
      r.dia,
      r.justificativa,
      u.id_usuario,
      u.nome AS nome_usuario,
      l.id_Laboratorio,
      l.numero AS numero_laboratorio
    FROM 
      reserva r
    INNER JOIN 
      usuarios u ON r.fk_usuario = u.id_usuario
    INNER JOIN 
      laboratorio l ON r.fk_laboratorio = l.id_Laboratorio
    WHERE 
      r.id_Reserva = ?
  `;

  const [rows] = await pool.query(query, [id]);
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  } else {
    throw new Error('Agendamento não encontrado');
  }
}

// pegar agendamentos do por usuário (função interna)
async function agendamentosPorUsuario(id_usuario: number): Promise<any[]> {
  const query = `
    SELECT 
      r.id_Reserva,
      r.horario,
      r.dia,
      r.justificativa,
      u.id_usuario,
      u.nome AS nome_usuario,
      l.id_Laboratorio,
      l.numero AS numero_laboratorio
    FROM 
      reserva r
    INNER JOIN 
      usuarios u ON r.fk_usuario = u.id_usuario
    INNER JOIN 
      laboratorio l ON r.fk_laboratorio = l.id_Laboratorio
    WHERE 
      u.id_usuario = ?
  `;

  const [rows] = await pool.query(query, [id_usuario]);
  if (!Array.isArray(rows)) {
    throw new Error('Unexpected query result format');
  }
  return rows as any[];
}

// deletar agendamento (função interna)
async function deletarAgendamento(id: number) {
  const query = 'DELETE FROM reserva WHERE id_Reserva = ?';
  const [result]: any = await pool.query(query, [id]);
  if (result?.affectedRows === 0) throw new Error('Agendamento não encontrado');
  return result;
}

// atualizar agendamento (função interna)
async function atualizarAgendamento(
  id: number,
  { horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario }: DbAgendamento
) {
  const query = `
    UPDATE reserva
    SET horario = ?, dia = ?, fk_aulas = ?, justificativa = ?, fk_laboratorio = ?, fk_usuario = ?
    WHERE id_Reserva = ?
  `;
  const values = [horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario, id];

  const [result]: any = await pool.query(query, values);
  if (result?.affectedRows === 0) throw new Error('Agendamento não encontrado');
  return result;
}

/* ===========================
   Handlers HTTP (exportados)
   =========================== */

function msg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

export const listarAgendamentos = async (_req: Request, res: Response) => {
  try {
    const data = await todosAgendamentos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos', details: msg(error) });
  }
};

export const buscarAgendamento = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const data = await agendamentoPorId(id);
    res.json(data);
  } catch (error) {
    const m = msg(error);
    if (m.includes('não encontrado')) return res.status(404).json({ error: m });
    res.status(500).json({ error: 'Erro ao buscar agendamento', details: m });
  }
};

export const listarAgendamentosPorUsuario = async (req: Request, res: Response) => {
  const id_usuario = Number(req.params.id_usuario);
  try {
    const data = await agendamentosPorUsuario(id_usuario);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos do usuário', details: msg(error) });
  }
};

export const criarAgendamento = async (req: Request, res: Response) => {
  const { horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario: bodyFkUsuario } = req.body as any as DbAgendamento & { fk_usuario?: number };
  try {
    // valida horario permitido
    if (!ALLOWED_TIMES.includes(horario)) {
      return res.status(400).json({ error: 'Horário inválido. Use um dos horários permitidos.' });
    }

    // bloqueia datas passadas
    const todayYMD = new Date();
    const y = todayYMD.getFullYear();
    const m = String(todayYMD.getMonth() + 1).padStart(2, '0');
    const d = String(todayYMD.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    if (dia < todayStr) {
      return res.status(400).json({ error: 'Não é permitido agendar para datas passadas.' });
    }

    const user = (req as any).user as { id_usuario: number; cargo: string } | undefined;
    if (!user) return res.status(401).json({ error: 'Não autenticado' });

    // Determina o usuário responsável conforme cargo
    let fk_usuario = bodyFkUsuario as unknown as number | null;
    if (user.cargo === 'Professor') {
      fk_usuario = user.id_usuario; // professor só pode agendar para si
    } else {
      // Coordenador/Auxiliar devem informar um professor
      if (!fk_usuario) return res.status(400).json({ error: 'Informe o professor responsável (fk_usuario).' });
      // Confere se o usuário existe e é Professor
      const [uRows]: any = await pool.query('SELECT cargo FROM usuarios WHERE id_usuario = ? LIMIT 1', [fk_usuario]);
      if (!Array.isArray(uRows) || uRows.length === 0) return res.status(404).json({ error: 'Professor não encontrado.' });
      if (uRows[0].cargo !== 'Professor') return res.status(400).json({ error: 'fk_usuario deve ser um Professor.' });
    }

    // fk_aulas opcional: se enviado, valida existência
    if (fk_aulas != null) {
      const [aRows]: any = await pool.query('SELECT id_disciplina FROM disciplina WHERE id_disciplina = ? LIMIT 1', [fk_aulas]);
      if (!Array.isArray(aRows) || aRows.length === 0) return res.status(404).json({ error: 'Disciplina não encontrada.' });
    }

    // bloqueia duplicidade: mesmo lab, dia e horário
    const [dup]: any = await pool.query(
      'SELECT id_Reserva FROM reserva WHERE fk_laboratorio = ? AND dia = ? AND horario = ? LIMIT 1',
      [fk_laboratorio, dia, horario]
    );
    if (Array.isArray(dup) && dup.length > 0) {
      return res.status(409).json({ error: 'Laboratório já reservado neste horário.' });
    }

    const result = await cadastrarAgendamento({ horario, dia, fk_aulas: fk_aulas as any, justificativa, fk_laboratorio, fk_usuario: fk_usuario as any });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar agendamento', details: error instanceof Error ? error.message : String(error) });
  }
};

export const removerAgendamento = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const result = await deletarAgendamento(id);
    res.json(result);
  } catch (error) {
    const m = msg(error);
    if (m.includes('não encontrado')) return res.status(404).json({ error: m });
    res.status(500).json({ error: 'Erro ao deletar agendamento', details: m });
  }
};

export const editarAgendamento = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario } = req.body as DbAgendamento;
  try {
    const result = await atualizarAgendamento(id, { horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario });
    res.json(result);
  } catch (error) {
    const m = msg(error);
    if (m.includes('não encontrado')) return res.status(404).json({ error: m });
    res.status(500).json({ error: 'Erro ao atualizar agendamento', details: m });
  }
};