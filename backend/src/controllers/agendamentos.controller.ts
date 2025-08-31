import { pool } from "../database/connection";
import { DbAgendamento } from "../models/agendamentos.model";
import { Request, Response } from "express";

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
  const { horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario } = req.body as DbAgendamento;
  try {
    const result = await cadastrarAgendamento({ horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar agendamento', details: msg(error) });
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