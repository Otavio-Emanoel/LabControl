import { pool } from "../database/connection";
import { Request, Response } from 'express';

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

export default async function todosHorariosFixos(){
    const [rows] = await pool.query("SELECT hf.id_horario_fixo, hf.dia_semana, hf.horario, u.id_usuario, u.nome AS nome_usuario, l.id_Laboratorio, l.numero AS nome_laboratorio FROM  horarios_fixos hf INNER JOIN  usuarios u ON hf.fk_usuario = u.id_usuario INNER JOIN  laboratorio l ON hf.fk_lab = l.id_Laboratorio");

    return rows
}

export async function deletarHorarioFixo(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const [result]: any = await pool.query('DELETE FROM horarios_fixos WHERE id_horario_fixo = ?',[id]);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: 'Horário fixo não encontrado' });
    }
    return res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: 'Erro ao remover horário fixo', details: msg });
  }
}

export async function criarHorarioFixo(req: Request, res: Response) {
  try {
    const { dia_semana, horario, fk_lab, fk_usuario } = req.body as {
      dia_semana?: string; horario?: string; fk_lab?: number; fk_usuario?: number;
    };

    if (!dia_semana || !horario || !fk_lab || !fk_usuario) {
      return res.status(400).json({ error: 'Campos obrigatórios: dia_semana, horario, fk_lab, fk_usuario' });
    }

    // normaliza dia_semana
    const ds = String(dia_semana).toLowerCase();
    const dias = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
    if (!dias.includes(ds)) {
      return res.status(400).json({ error: 'dia_semana inválido. Use: domingo, segunda, terca, quarta, quinta, sexta, sabado' });
    }

    if (!ALLOWED_TIMES.includes(horario)) {
      return res.status(400).json({ error: 'Horário inválido. Use um dos horários permitidos.' });
    }

    // valida se o usuário existe e é Professor
    const [uRows]: any = await pool.query('SELECT cargo FROM usuarios WHERE id_usuario = ? LIMIT 1', [fk_usuario]);
    if (!Array.isArray(uRows) || uRows.length === 0) return res.status(404).json({ error: 'Professor não encontrado.' });
    if (uRows[0].cargo !== 'Professor') return res.status(400).json({ error: 'fk_usuario deve ser um Professor.' });

    // checa duplicidade
    const [dup]: any = await pool.query(
      'SELECT id_horario_fixo FROM horarios_fixos WHERE fk_lab = ? AND dia_semana = ? AND horario = ? LIMIT 1',
      [fk_lab, ds, horario]
    );
    if (Array.isArray(dup) && dup.length > 0) {
      return res.status(409).json({ error: 'Já existe horário fixo para este laboratório, dia da semana e horário.' });
    }

    const [ins]: any = await pool.query(
      'INSERT INTO horarios_fixos (dia_semana, horario, fk_usuario, fk_lab) VALUES (?, ?, ?, ?)',
      [ds, horario, fk_usuario, fk_lab]
    );
    return res.status(201).json({ id_horario_fixo: ins?.insertId, dia_semana: ds, horario, fk_usuario, fk_lab });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: 'Erro ao criar horário fixo', details: msg });
  }
}