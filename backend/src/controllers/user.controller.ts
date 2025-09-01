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

        // Verifica se o e-mail já está cadastrado
        const [rows] = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1',
            [email]
        );
        if (Array.isArray(rows) && rows.length > 0) {
            return res.status(409).json({ error: 'E-mail já cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        await pool.query(
            'INSERT INTO usuarios (id_usuario, email, nome, senha, cargo) VALUES (?, ?, ?, ?, ?)',
            [null, email, nome, hashedPassword, cargo]
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

export async function adicionarCurso(req: Request, res: Response) {
    try {
        // Verifica se o usuário é Auxiliar_Docente
        const usuario = (req as any).user;
        if (!usuario || usuario.cargo !== 'Auxiliar_Docente') {
            return res.status(403).json({ error: 'Apenas Auxiliar Docente pode adicionar curso.' });
        }

        const { nome } = req.body;
        if (!nome) {
            return res.status(400).json({ error: 'Informe o nome do curso.' });
        }

        await pool.query('INSERT INTO curso (nome) VALUES (?)', [nome]);
        return res.status(201).json({ message: 'Curso adicionado com sucesso!' });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return res.status(500).json({ error: message });
    }
}

export async function adicionarDisciplina(req: Request, res: Response) {
    try {
        const usuario = (req as any).user;
        if (!usuario || (usuario.cargo !== 'Coordenador' && usuario.cargo !== 'Auxiliar_Docente')) {
            return res.status(403).json({ error: 'Apenas Coordenador ou Auxiliar Docente pode adicionar disciplina.' });
        }

        const { nome, id_curso } = req.body;
        if (!nome || !id_curso) {
            return res.status(400).json({ error: 'Informe o nome da disciplina e o id do curso.' });
        }

        // Verifica se o curso existe
        const [cursoRows] = await pool.query('SELECT id_curso FROM curso WHERE id_curso = ?', [id_curso]);
        if (!Array.isArray(cursoRows) || cursoRows.length === 0) {
            return res.status(404).json({ error: 'Curso não encontrado.' });
        }

        await pool.query('INSERT INTO disciplina (nome, id_curso) VALUES (?, ?)', [nome, id_curso]);
        return res.status(201).json({ message: 'Disciplina adicionada com sucesso!' });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return res.status(500).json({ error: message });
    }
}

export async function vincularProfessorDisciplina(req: Request, res: Response) {
    try {
        // Apenas Coordenador ou Auxiliar Docente podem vincular
        const usuario = (req as any).user;
        if (!usuario || (usuario.cargo !== 'Coordenador' && usuario.cargo !== 'Auxiliar_Docente')) {
            return res.status(403).json({ error: 'Apenas Coordenador ou Auxiliar Docente pode vincular professor à disciplina.' });
        }

        const { id_usuario, id_disciplina } = req.body;
        if (!id_usuario || !id_disciplina) {
            return res.status(400).json({ error: 'Informe o id do professor e o id da disciplina.' });
        }

        // Verifica se o professor existe
        const [profRows] = await pool.query('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [id_usuario]);
        if (!Array.isArray(profRows) || profRows.length === 0) {
            return res.status(404).json({ error: 'Professor não encontrado.' });
        }

        // Verifica se a disciplina existe
        const [discRows] = await pool.query('SELECT id_disciplina FROM disciplina WHERE id_disciplina = ?', [id_disciplina]);
        if (!Array.isArray(discRows) || discRows.length === 0) {
            return res.status(404).json({ error: 'Disciplina não encontrada.' });
        }

        // Verifica se já está vinculado
        const [vincRows] = await pool.query(
            'SELECT id FROM professor_disciplina WHERE id_usuario = ? AND id_disciplina = ?',
            [id_usuario, id_disciplina]
        );
        if (Array.isArray(vincRows) && vincRows.length > 0) {
            return res.status(409).json({ error: 'Professor já vinculado à disciplina.' });
        }

        await pool.query(
            'INSERT INTO professor_disciplina (id_usuario, id_disciplina) VALUES (?, ?)',
            [id_usuario, id_disciplina]
        );
        return res.status(201).json({ message: 'Professor vinculado à disciplina com sucesso!' });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return res.status(500).json({ error: message });
    }
}

export async function desvincularProfessorDisciplina(req: Request, res: Response) {
    try {
        // Apenas Coordenador ou Auxiliar Docente podem desvincular
        const usuario = (req as any).user;
        if (!usuario || (usuario.cargo !== 'Coordenador' && usuario.cargo !== 'Auxiliar_Docente')) {
            return res.status(403).json({ error: 'Apenas Coordenador ou Auxiliar Docente pode desvincular professor da disciplina.' });
        }

        const { id_usuario, id_disciplina } = req.body || {};
        if (!id_usuario || !id_disciplina) {
            return res.status(400).json({ error: 'Informe o id do professor e o id da disciplina.' });
        }

        // Verifica se vínculo existe
        const [vincRows] = await pool.query(
            'SELECT id FROM professor_disciplina WHERE id_usuario = ? AND id_disciplina = ? LIMIT 1',
            [id_usuario, id_disciplina]
        );
        if (!Array.isArray(vincRows) || vincRows.length === 0) {
            return res.status(404).json({ error: 'Vínculo não encontrado.' });
        }

        await pool.query(
            'DELETE FROM professor_disciplina WHERE id_usuario = ? AND id_disciplina = ?',
            [id_usuario, id_disciplina]
        );
        return res.status(200).json({ message: 'Vínculo removido com sucesso!' });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return res.status(500).json({ error: message });
    }
}

export async function listarCursos(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT id_curso, nome FROM curso');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar cursos.' });
  }
}

export async function listarDisciplinas(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT id_disciplina, nome, id_curso FROM disciplina');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar disciplinas.' });
  }
}

export async function listarProfessoresDisciplinas(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query(`
      SELECT pd.id_usuario, u.nome AS nome_professor, pd.id_disciplina, d.nome AS nome_disciplina
      FROM professor_disciplina pd
      INNER JOIN usuarios u ON pd.id_usuario = u.id_usuario
      INNER JOIN disciplina d ON pd.id_disciplina = d.id_disciplina
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar vínculos de professor com disciplina.' });
  }
}

export async function listarProfessores(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, nome, email FROM usuarios WHERE cargo = \"Professor\"'
    );
    return res.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao listar professores.';
    return res.status(500).json({ error: message });
  }
}