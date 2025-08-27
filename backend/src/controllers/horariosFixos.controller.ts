import { pool } from "../database/connection";

export default async function todosHorariosFixos(){
    const [rows] = await pool.query("SELECT hf.id_horario_fixo, hf.dia_semana, hf.horario, u.id_usuario, u.nome AS nome_usuario, l.id_Laboratorio, l.numero AS nome_laboratorio FROM  horarios_fixos hf INNER JOIN  usuarios u ON hf.fk_usuario = u.id_usuario INNER JOIN  laboratorio l ON hf.fk_lab = l.id_Laboratorio");

    return rows
}