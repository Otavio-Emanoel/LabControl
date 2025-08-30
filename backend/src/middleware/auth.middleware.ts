import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

export interface AuthPayload {
	sub: number;
	nome: string;
	cargo: string;
	iat?: number | undefined;
	exp?: number | undefined;
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) return res.status(401).json({ error: 'Token ausente' });

		const secret = process.env.JWT_SECRET as Secret | undefined;
		if (!secret) return res.status(500).json({ error: 'JWT_SECRET não configurado' });

			const decoded = jwt.verify(token, secret as Secret);
			const payload = (typeof decoded === 'string' ? JSON.parse(decoded) : decoded) as JwtPayload;
				const subRaw = payload.sub as unknown;
				const subNum = typeof subRaw === 'string' ? Number(subRaw) : (subRaw as number | undefined);
				const userPayload: AuthPayload = {
					sub: subNum ?? 0,
				nome: (payload as any).nome,
				cargo: (payload as any).cargo,
				iat: payload.iat,
				exp: payload.exp,
			};
			(req as any).user = userPayload;
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Token inválido' });
	}
}

export function requireRole(roles: string[] | string, ...rest: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as AuthPayload | undefined;
        // Junta todos os cargos em um array, seja vindo como array ou argumentos separados
        const allowedRoles = Array.isArray(roles) ? roles : [roles, ...rest];
        if (!user) return res.status(401).json({ error: 'Não autenticado' });
        if (!allowedRoles.includes(user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
        next();
    };
}