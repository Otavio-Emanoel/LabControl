import { pool } from "../database/connection";

export async function getAllLabs() {
    const [rows] = await pool.query('SELECT id_Laboratorio, numero, descricao FROM laboratorio ORDER BY id_Laboratorio');
    return rows;
}

export async function createLab({ numero, descricao }: { numero: string; descricao?: string | null }) {
    if (!numero || typeof numero !== 'string' || numero.trim().length === 0) {
        throw new Error('Nome/numero do laboratório é obrigatório.');
    }
    const nome = numero.trim();
    // Checa duplicidade exata (case insensitive)
    const [dup]: any = await pool.query('SELECT id_Laboratorio FROM laboratorio WHERE LOWER(numero) = LOWER(?) LIMIT 1', [nome]);
    if (Array.isArray(dup) && dup.length > 0) {
        const err: any = new Error('Já existe um laboratório com esse nome.');
        err.code = 'LAB_DUP';
        throw err;
    }
    const [ins]: any = await pool.query('INSERT INTO laboratorio (numero, descricao) VALUES (?, ?)', [nome, descricao || null]);
    return { id_Laboratorio: ins.insertId, numero: nome, descricao: descricao || null };
}

export async function deleteLab(id: number) {
    // (Opcional) Verificar se há reservas associadas antes de excluir
    const [resv]: any = await pool.query('SELECT id_Reserva FROM reserva WHERE fk_laboratorio = ? LIMIT 1', [id]);
    if (Array.isArray(resv) && resv.length > 0) {
        const err: any = new Error('Existem reservas vinculadas a este laboratório. Exclua ou remova as reservas antes.');
        err.code = 'LAB_IN_USE';
        throw err;
    }
    const [del]: any = await pool.query('DELETE FROM laboratorio WHERE id_Laboratorio = ? LIMIT 1', [id]);
    if (del.affectedRows === 0) {
        const err: any = new Error('Laboratório não encontrado.');
        err.code = 'LAB_NOT_FOUND';
        throw err;
    }
    return { ok: true };
}

export async function updateLab(id: number, { numero, descricao }: { numero?: string; descricao?: string | null }) {
    if (!id || Number.isNaN(Number(id))) {
        throw new Error('ID inválido.');
    }
    // Verifica existência
    const [exist]: any = await pool.query('SELECT id_Laboratorio FROM laboratorio WHERE id_Laboratorio = ? LIMIT 1', [id]);
    if (!Array.isArray(exist) || exist.length === 0) {
        const err: any = new Error('Laboratório não encontrado.');
        err.code = 'LAB_NOT_FOUND';
        throw err;
    }

    // Se enviar numero, validar e checar duplicidade
    let novoNumero: string | undefined = undefined;
    if (typeof numero !== 'undefined') {
        if (!numero || typeof numero !== 'string' || numero.trim().length === 0) {
            const err: any = new Error('O "numero" do laboratório é obrigatório.');
            err.code = 'LAB_INVALID';
            throw err;
        }
        novoNumero = numero.trim();
        const [dup]: any = await pool.query(
            'SELECT id_Laboratorio FROM laboratorio WHERE LOWER(numero) = LOWER(?) AND id_Laboratorio <> ? LIMIT 1',
            [novoNumero, id]
        );
        if (Array.isArray(dup) && dup.length > 0) {
            const err: any = new Error('Já existe um laboratório com esse nome.');
            err.code = 'LAB_DUP';
            throw err;
        }
    }

    // Monta atualização dinâmica
    const fields: string[] = [];
    const params: any[] = [];
    if (typeof novoNumero !== 'undefined') { fields.push('numero = ?'); params.push(novoNumero); }
    if (typeof descricao !== 'undefined') { fields.push('descricao = ?'); params.push(descricao || null); }

    if (fields.length === 0) {
        return { message: 'Nada para atualizar.', user: undefined };
    }

    params.push(id);
    const sql = `UPDATE laboratorio SET ${fields.join(', ')} WHERE id_Laboratorio = ?`;
    const [upd]: any = await pool.query(sql, params);
    if (upd.affectedRows === 0) {
        const err: any = new Error('Falha ao atualizar laboratório.');
        err.code = 'LAB_UPDATE_FAIL';
        throw err;
    }
    // Retorna registro atualizado
    const [rows]: any = await pool.query('SELECT id_Laboratorio, numero, descricao FROM laboratorio WHERE id_Laboratorio = ? LIMIT 1', [id]);
    return rows?.[0] || { id_Laboratorio: id, numero: novoNumero, descricao: descricao || null };
}