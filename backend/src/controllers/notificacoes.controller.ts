import { Request, Response } from 'express';
import { pool } from '../database/connection';

// Garante existência da tabela (idempotente)
async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS notificacao (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(60) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    id_usuario_destino INT NOT NULL,
    lida TINYINT(1) DEFAULT 0,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_destino) REFERENCES usuarios(id_usuario)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
}

export const listarNotificacoes = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id_usuario: number } | undefined;
    if (!user) return res.status(401).json({ error: 'Não autenticado' });
    await ensureTable();
    const [rows]: any = await pool.query(
      `SELECT id_notificacao, tipo, titulo, mensagem, lida, data_criacao
       FROM notificacao
       WHERE id_usuario_destino = ?
       ORDER BY lida ASC, data_criacao DESC`,
      [user.id_usuario]
    );
    res.json(rows || []);
  } catch (e) {
    console.error('Erro listarNotificacoes', e);
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
};

export const marcarNotificacaoLida = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id_usuario: number } | undefined;
    if (!user) return res.status(401).json({ error: 'Não autenticado' });
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    await ensureTable();
    const [result]: any = await pool.query(
      'UPDATE notificacao SET lida = 1 WHERE id_notificacao = ? AND id_usuario_destino = ? LIMIT 1',
      [id, user.id_usuario]
    );
    if (result?.affectedRows === 0) return res.status(404).json({ error: 'Notificação não encontrada' });
    res.json({ ok: true });
  } catch (e) {
    console.error('Erro marcarNotificacaoLida', e);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
};

export const marcarTodasLidas = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id_usuario: number } | undefined;
    if (!user) return res.status(401).json({ error: 'Não autenticado' });
    await ensureTable();
    const [result]: any = await pool.query(
      'UPDATE notificacao SET lida = 1 WHERE id_usuario_destino = ? AND lida = 0',
      [user.id_usuario]
    );
    res.json({ ok: true, atualizadas: result?.affectedRows || 0 });
  } catch (e) {
    console.error('Erro marcarTodasLidas', e);
    res.status(500).json({ error: 'Erro ao marcar todas notificações' });
  }
};
