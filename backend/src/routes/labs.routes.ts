import { Router } from "express";
import { getAllLabs, createLab, deleteLab } from "../controllers/labs.controller";
import { authRequired, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get('/all', async (req, res) => {
    try {
        const labs = await getAllLabs();
        res.json(labs);
    } catch (error) {
        console.error('Erro ao buscar laboratórios:', error);
        res.status(500).json({ error: 'Erro ao buscar laboratórios', details: error instanceof Error ? error.message : error });
    }
});

// Criar laboratório
router.post('/', authRequired, requireRole('Auxiliar_Docente'), async (req, res) => {
    try {
        const { numero, descricao } = req.body;
        const lab = await createLab({ numero, descricao });
        res.status(201).json(lab);
    } catch (error: any) {
        console.error('Erro ao criar laboratório:', error);
        if (error.code === 'LAB_DUP') {
            return res.status(409).json({ error: 'Duplicado', message: error.message });
        }
        if (error instanceof Error) {
            return res.status(400).json({ error: 'Erro ao criar laboratório', message: error.message });
        }
        res.status(500).json({ error: 'Erro interno ao criar laboratório' });
    }
});

// Remover laboratório
router.delete('/:id', authRequired, requireRole('Auxiliar_Docente'), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        const result = await deleteLab(id);
        res.json(result);
    } catch (error: any) {
        console.error('Erro ao remover laboratório:', error);
        if (error.code === 'LAB_IN_USE') {
            return res.status(409).json({ error: 'Em uso', message: error.message });
        }
        if (error.code === 'LAB_NOT_FOUND') {
            return res.status(404).json({ error: 'Não encontrado', message: error.message });
        }
        if (error instanceof Error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erro interno ao remover laboratório' });
    }
});

export default router;