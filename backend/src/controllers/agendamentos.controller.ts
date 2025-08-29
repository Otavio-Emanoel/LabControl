import { pool } from "../database/connection";
import { DbAgendamento } from "../models/agendamentos.model";

// cadastrar novo agendamento
export async function cadastrarAgendamento(
    {horario,
        dia,
        fk_aulas,
        justificativa,
        fk_laboratorio,
        fk_usuario
    }: DbAgendamento) {
    const sql = `
        INSERT INTO agendamentos (
            horario,
            dia,
            fk_aulas,
            justificativa,
            fk_laboratorio,
            fk_usuario
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario];

    try {
        const [result] = await pool.query(sql, values);
        console.log("Agendamento cadastrado com sucesso:", result);
        return result;
    } catch (error) {
        console.error("Erro ao cadastrar agendamento:", error);
        throw error;
    }
}

// listar todos os agendamentos
export async function todosAgendamentos() {
  const query = `
    SELECT 
      r.id_Reserva,
      r.horario,
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

// Pegar agendamento específico
export async function agendamentoPorId(id: number) {
  const query = `
    SELECT 
      r.id_Reserva,
      r.horario,
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

// pegar agendamentos do por usuário
export async function agendamentosPorUsuario(id_usuario: number): Promise<any[]> {
  const query = `
    SELECT 
      r.id_Reserva,
      r.horario,
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

// deletar agendamento
export async function deletarAgendamento(id: number, user: any) {
  // Adicionar verificação se usuário e coordenador/auxiliar docente ou dono do agendamento
  if (!user) {
   return Promise.reject(new Error('Usuário não autenticado'));
  }
  const sel_query = `
    SELECT 
      reserva.id_Reserva,
      reserva.id_usuario,
    FROM 
      reserva
    WHERE 
      reserva.id_Reserva = ?
  `;

  const [rows] = await pool.query(sel_query, [id]);
  if (Array.isArray(rows) && rows.length > 0) {
    const owner_id = (rows[0] as any).id_usuario;
    if (user.cargo !== 'coordenador' && user.cargo !== 'auxiliar_docente') {
      if (user.sub !== owner_id) {
        return Promise.reject(new Error('Permissão negada: você não pode deletar este agendamento'));
      }
    }
  } else {
    throw new Error('Agendamento não encontrado');
  }

  const query = 'DELETE FROM reserva WHERE id_Reserva = ?';
  try {
    const [result] = await pool.query(query, [id]);
    console.log("Agendamento deletado com sucesso:", result);
    return result;
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    throw error;
  }
}

// atualizar agendamento
export async function atualizarAgendamento(
  // Adicionar verificação se usuário e coordenador/auxiliar docente ou dono do agendamento

  id: number, user: any,
  { horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario }: DbAgendamento
) {

  if (!user) {
    return Promise.reject(new Error('Usuário não autenticado'));
   }
   const sel_query = `
     SELECT 
       reserva.id_Reserva,
       reserva.id_usuario,
     FROM 
       reserva
     WHERE 
       reserva.id_Reserva = ?
   `;
 
   const [rows] = await pool.query(sel_query, [id]);
   if (Array.isArray(rows) && rows.length > 0) {
     const owner_id = (rows[0] as any).id_usuario;
     if (user.cargo !== 'coordenador' && user.cargo !== 'auxiliar_docente') {
       if (user.sub !== owner_id) {
         return Promise.reject(new Error('Permissão negada: você não pode deletar este agendamento'));
       }
     }
   } else {
     throw new Error('Agendamento não encontrado');
   }

  const query = `
    UPDATE reserva
    SET horario = ?, dia = ?, fk_aulas = ?, justificativa = ?, fk_laboratorio = ?, fk_usuario = ?
    WHERE id_Reserva = ?
  `;
  const values = [horario, dia, fk_aulas, justificativa, fk_laboratorio, fk_usuario, id];

  try {
    const [result] = await pool.query(query, values);
    console.log("Agendamento atualizado com sucesso:", result);
    return result;
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    throw error;
  }
}