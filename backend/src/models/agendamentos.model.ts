export type Agendamento = {
    id_agendamento: number;
    data: string; // formato: 'YYYY-MM-DD'
    horario: string; // formato: 'HH:mm:ss'
    id_usuario: number;
    nome_usuario: string;
    id_Laboratorio: number;
    numero_laboratorio: string; // nome do laboratório
};

export type DbAgendamento = {
    horario: string;
    dia: string;
    fk_aulas: number;
    justificativa: string;
    fk_laboratorio: number;
    fk_usuario: number;
}