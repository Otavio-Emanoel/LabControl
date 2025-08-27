import { pool } from "../database/connection";

export default async function todosAgendamentos() {
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
