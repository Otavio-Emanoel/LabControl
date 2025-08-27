-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 27/08/2025 às 21:22
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `lab_control`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `horarios_fixos`
--

CREATE TABLE `horarios_fixos` (
  `id_horario_fixo` int(11) NOT NULL,
  `dia_semana` varchar(45) NOT NULL,
  `fk_usuario` int(11) NOT NULL,
  `fk_lab` int(11) NOT NULL,
  `horario` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `horarios_fixos`
--
ALTER TABLE `horarios_fixos`
  ADD PRIMARY KEY (`id_horario_fixo`),
  ADD KEY `horarios_fixos_ibfk_1` (`fk_usuario`),
  ADD KEY `laboratorio_id_lab` (`fk_lab`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `horarios_fixos`
--
ALTER TABLE `horarios_fixos`
  MODIFY `id_horario_fixo` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `horarios_fixos`
--
ALTER TABLE `horarios_fixos`
  ADD CONSTRAINT `horarios_fixos_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `laboratorio_id_lab` FOREIGN KEY (`fk_lab`) REFERENCES `laboratorio` (`id_Laboratorio`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
