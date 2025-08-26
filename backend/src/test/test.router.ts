import { Router } from 'express';
import { checkDbConnection, pool } from '../database/connection';

const router = Router();

// Rota para testar a conexão com o banco
router.get('/health/db', async (_req, res) => {
  const result = await checkDbConnection();
  if (result.ok) {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(500).json({ status: 'error', error: result.error });
  }
});

// Exemplo de rota que faz uma query simples
router.get('/now', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;