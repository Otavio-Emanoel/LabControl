CREATE DATABASE lab_control;
USE lab_control;


CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    cargos VARCHAR(45),
    senha VARCHAR(255) NOT NULL
);


CREATE TABLE Laboratorio (
    id_Laboratorio INT PRIMARY KEY AUTO_INCREMENT,
    numero varchar(30) NOT NULL,
    horario_fixo DATETIME
);


CREATE TABLE Reserva (
    id_Reserva INT PRIMARY KEY AUTO_INCREMENT,
    horario TIME NOT NULL,
    dia DATE NOT NULL,
    fk_aulas INT, 
    justificativa VARCHAR(300),
    fk_laboratorio INT NOT NULL,
    usuarios_id_usuario INT NOT NULL,
    FOREIGN KEY (fk_laboratorio) REFERENCES Laboratorio(id_Laboratorio),
    FOREIGN KEY (usuarios_id_usuario) REFERENCES usuarios(id_usuario)
);


CREATE TABLE horarios_fixos (
    id_horario_fixo INT PRIMARY KEY AUTO_INCREMENT,
    dia_semana VARCHAR(45) NOT NULL,
    usuarios_id_usuario INT NOT NULL,
    horario TIME NOT NULL,
    FOREIGN KEY (usuarios_id_usuario) REFERENCES usuarios(id_usuario)
);


CREATE TABLE Horarios (
    id_Horarios INT PRIMARY KEY AUTO_INCREMENT,
    Horas DATETIME NOT NULL,
    Reserva_id_Reserva INT NOT NULL,
    FOREIGN KEY (Reserva_id_Reserva) REFERENCES Reserva(id_Reserva)
);
