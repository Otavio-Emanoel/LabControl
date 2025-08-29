import { Request, Response } from 'express';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { pool } from '../database/connection';
import bcrypt from 'bcrypt';
import { DbUser } from '../models/user.model';

export async function register(req: Request, res: Response) {
    try {
        const { nome, email, senha, cargo } = req.body as { nome: string; email: string; senha: string; cargo: string };
        if (!nome || !email || !senha || !cargo) {
            return res.status(400).json({ error: 'Informe nome, email, senha e cargo.' });
        }
        const hashedPassword = await bcrypt.hash(senha, 10);
        await pool.query(
            'INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?)',
            [nome, email, hashedPassword, cargo]
        );
        return res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return res.status(500).json({ error: message });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, senha } = req.body as { email?: string; senha?: string };
        if (!email || !senha) {
            return res.status(400).json({ error: 'Informe email e senha.' });
        }
        const [rows] = await pool.query(
            'SELECT id_usuario, nome, email, cargo, senha FROM usuarios WHERE email = ? LIMIT 1',
            [email]
        );
        const user = Array.isArray(rows) && rows.length ? (rows[0] as DbUser) : null;
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        const passwordOk = await bcrypt.compare(senha, user.senha);
        if (!passwordOk) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        const secret = process.env.JWT_SECRET as Secret | undefined;
        if (!secret) {
            return res.status(500).json({ error: 'JWT_SECRET não configurado no servidor.' });
        }
        const payload: JwtPayload = { sub: user.id_usuario, nome: user.nome, cargo: user.cargo } as any;
        const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '8h' };
        const token = jwt.sign(payload, secret as Secret, options);
        return res.json({
            token,
            user: {
                id_usuario: user.id_usuario,
                nome: user.nome,
                email: user.email,
                cargo: user.cargo,
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return res.status(500).json({ error: message });
    }
}

