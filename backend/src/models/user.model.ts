// sim
export type Cargo = 'Professor' | 'Coordenador' | 'Auxiliar_Docente';

export interface DbUser {
	id_usuario: number;
	nome: string;
	email: string;
	cargo: Cargo;
	senha: string;
}
