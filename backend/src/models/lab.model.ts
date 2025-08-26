export type LabNome = 'lab1' | 'lab2' | 'lab3' | 'lab4' | 'auditorio';

export interface Lab {
	id_laboratorio: number;
	lab: LabNome;
	fk_horario_fixo: number | null;
}
