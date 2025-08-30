import { pool } from "../database/connection";

export async function getAllLabs(){
    const query = `SELECT * FROM laboratorio`;
    const [rows] = await pool.query(query);
    return rows;
}