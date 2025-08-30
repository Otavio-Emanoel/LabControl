import { Router } from "express";
import { getAllLabs } from "../controllers/labs.controller";

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

export default router;