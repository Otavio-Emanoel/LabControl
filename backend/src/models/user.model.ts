// sim
export type Cargo = 'Professor' | 'Coordenador' | 'Auxiliar_Docente';

export interface User {
	id_usuario: number;
	nome: string;
	cargo: Cargo;
	senha: string;
}
