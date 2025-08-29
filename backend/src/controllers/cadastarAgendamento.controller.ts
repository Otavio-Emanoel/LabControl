import { pool } from "../database/connection";
import { DbAgendamento } from "../models/agendamentos.model";

export default async function cadastrarAgendamento(
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
