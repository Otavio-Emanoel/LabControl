import mysql from 'mysql2/promise';

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
} = process.env;

// Avisos básicos se algo essencial não estiver definido
if (!DB_HOST || !DB_USER || !DB_NAME) {
  console.warn('[database] Variáveis de ambiente ausentes: verifique DB_HOST, DB_USER e DB_NAME.');
}

export const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || '',
  port: Number(DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Testa a conexão sem encerrar o pool
export async function checkDbConnection() {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.ping();
      await conn.query('SELECT 1');
    } finally {
      conn.release();
    }
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
    return { ok: false, error: message };
  }
}

// utilitário para fechar o pool manualmente se precisar
export async function closeDbPool() {
  await pool.end();
}