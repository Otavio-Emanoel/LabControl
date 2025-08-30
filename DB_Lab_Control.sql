-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 30, 2025 at 01:28 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lab_control`
--
CREATE DATABASE IF NOT EXISTS `lab_control` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `lab_control`;

-- --------------------------------------------------------

--
-- Table structure for table `horarios`
--

CREATE TABLE `horarios` (
  `id_Horarios` int(11) NOT NULL,
  `Horas` datetime NOT NULL,
  `Reserva_id_Reserva` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `horarios_fixos`
--

CREATE TABLE `horarios_fixos` (
  `id_horario_fixo` int(11) NOT NULL,
  `dia_semana` varchar(45) NOT NULL,
  `fk_usuario` int(11) NOT NULL,
  `fk_lab` int(11) NOT NULL,
  `horario` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laboratorio`
--

CREATE TABLE `laboratorio` (
  `id_Laboratorio` int(11) NOT NULL,
  `numero` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laboratorio`
--

INSERT INTO `laboratorio` (`id_Laboratorio`, `numero`) VALUES
(2, 'lab1'),
(3, 'lab2'),
(4, 'lab3'),
(5, 'lab4'),
(6, 'auditorio');

-- --------------------------------------------------------

--
-- Table structure for table `reserva`
--

CREATE TABLE `reserva` (
  `id_Reserva` int(11) NOT NULL,
  `horario` time NOT NULL,
  `dia` date NOT NULL,
  `fk_aulas` int(11) DEFAULT NULL,
  `justificativa` varchar(300) DEFAULT NULL,
  `fk_laboratorio` int(11) NOT NULL,
  `fk_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nome` varchar(45) NOT NULL,
  `cargo` varchar(45) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id_Horarios`),
  ADD KEY `Reserva_id_Reserva` (`Reserva_id_Reserva`);

--
-- Indexes for table `horarios_fixos`
--
ALTER TABLE `horarios_fixos`
  ADD PRIMARY KEY (`id_horario_fixo`),
  ADD KEY `usuarios_id_usuario` (`fk_usuario`);

--
-- Indexes for table `laboratorio`
--
ALTER TABLE `laboratorio`
  ADD PRIMARY KEY (`id_Laboratorio`);

--
-- Indexes for table `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`id_Reserva`),
  ADD KEY `fk_laboratorio` (`fk_laboratorio`),
  ADD KEY `usuarios_id_usuario` (`fk_usuario`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_Horarios` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `horarios_fixos`
--
ALTER TABLE `horarios_fixos`
  MODIFY `id_horario_fixo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `laboratorio`
--
ALTER TABLE `laboratorio`
  MODIFY `id_Laboratorio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reserva`
--
ALTER TABLE `reserva`
  MODIFY `id_Reserva` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`Reserva_id_Reserva`) REFERENCES `reserva` (`id_Reserva`);

--
-- Constraints for table `horarios_fixos`
--
ALTER TABLE `horarios_fixos`
  ADD CONSTRAINT `horarios_fixos_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Constraints for table `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`fk_laboratorio`) REFERENCES `laboratorio` (`id_Laboratorio`),
  ADD CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Tabela de Curso
CREATE TABLE curso (
  id_curso INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL
);

-- Tabela de Disciplina
CREATE TABLE disciplina (
  id_disciplina INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  id_curso INT NOT NULL,
  FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
);

-- Vínculo Professor-Disciplina
CREATE TABLE professor_disciplina (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_disciplina INT NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_disciplina) REFERENCES disciplina(id_disciplina)
);

-- Relaciona reserva ao id_disciplina via fk_aulas
ALTER TABLE reserva ADD CONSTRAINT reserva_ibfk_3 FOREIGN KEY (fk_aulas) REFERENCES disciplina(id_disciplina);