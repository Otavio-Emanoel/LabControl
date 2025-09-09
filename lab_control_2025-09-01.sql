-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: lab_control
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `lab_control`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `lab_control` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `lab_control`;

--
-- Table structure for table `curso`
--

DROP TABLE IF EXISTS `curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curso` (
  `id_curso` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso`
--

LOCK TABLES `curso` WRITE;
/*!40000 ALTER TABLE `curso` DISABLE KEYS */;
INSERT INTO `curso` VALUES (1,'Desenvolvimento de Sistemas'),(2,'Administração'),(4,'Jogos digitais');
/*!40000 ALTER TABLE `curso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disciplina`
--

DROP TABLE IF EXISTS `disciplina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplina` (
  `id_disciplina` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `id_curso` int NOT NULL,
  PRIMARY KEY (`id_disciplina`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `disciplina_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplina`
--

LOCK TABLES `disciplina` WRITE;
/*!40000 ALTER TABLE `disciplina` DISABLE KEYS */;
INSERT INTO `disciplina` VALUES (1,'Programação Web',1),(2,'Portugues',1),(3,'Portugues',2),(4,'Matematica',1),(5,'Matematica',2),(6,'Matemática',4),(7,'Programação de Aplicativos Mobile',1);
/*!40000 ALTER TABLE `disciplina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios`
--

DROP TABLE IF EXISTS `horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios` (
  `id_Horarios` int NOT NULL AUTO_INCREMENT,
  `Horas` datetime NOT NULL,
  `Reserva_id_Reserva` int NOT NULL,
  PRIMARY KEY (`id_Horarios`),
  KEY `Reserva_id_Reserva` (`Reserva_id_Reserva`),
  CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`Reserva_id_Reserva`) REFERENCES `reserva` (`id_Reserva`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios`
--

LOCK TABLES `horarios` WRITE;
/*!40000 ALTER TABLE `horarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios_fixos`
--

DROP TABLE IF EXISTS `horarios_fixos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_fixos` (
  `id_horario_fixo` int NOT NULL AUTO_INCREMENT,
  `dia_semana` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `fk_usuario` int NOT NULL,
  `fk_lab` int NOT NULL,
  `horario` time NOT NULL,
  PRIMARY KEY (`id_horario_fixo`),
  KEY `usuarios_id_usuario` (`fk_usuario`),
  CONSTRAINT `horarios_fixos_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_fixos`
--

LOCK TABLES `horarios_fixos` WRITE;
/*!40000 ALTER TABLE `horarios_fixos` DISABLE KEYS */;
INSERT INTO `horarios_fixos` VALUES (1,'sexta',7,5,'15:10:00'),(2,'terca',6,6,'13:30:00'),(3,'quarta',2,4,'10:50:00');
/*!40000 ALTER TABLE `horarios_fixos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratorio`
--

DROP TABLE IF EXISTS `laboratorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laboratorio` (
  `id_Laboratorio` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_Laboratorio`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratorio`
--

LOCK TABLES `laboratorio` WRITE;
/*!40000 ALTER TABLE `laboratorio` DISABLE KEYS */;
INSERT INTO `laboratorio` VALUES (2,'lab1'),(3,'lab2'),(4,'lab3'),(5,'lab4'),(6,'auditorio');
/*!40000 ALTER TABLE `laboratorio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professor_disciplina`
--

DROP TABLE IF EXISTS `professor_disciplina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professor_disciplina` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_disciplina` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_disciplina` (`id_disciplina`),
  CONSTRAINT `professor_disciplina_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `professor_disciplina_ibfk_2` FOREIGN KEY (`id_disciplina`) REFERENCES `disciplina` (`id_disciplina`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professor_disciplina`
--

LOCK TABLES `professor_disciplina` WRITE;
/*!40000 ALTER TABLE `professor_disciplina` DISABLE KEYS */;
INSERT INTO `professor_disciplina` VALUES (1,2,1),(2,3,1),(3,6,2),(4,6,3),(5,7,7);
/*!40000 ALTER TABLE `professor_disciplina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id_Reserva` int NOT NULL AUTO_INCREMENT,
  `horario` time NOT NULL,
  `dia` date NOT NULL,
  `fk_aulas` int DEFAULT NULL,
  `justificativa` varchar(300) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fk_laboratorio` int NOT NULL,
  `fk_usuario` int NOT NULL,
  PRIMARY KEY (`id_Reserva`),
  KEY `fk_laboratorio` (`fk_laboratorio`),
  KEY `usuarios_id_usuario` (`fk_usuario`),
  KEY `reserva_ibfk_3` (`fk_aulas`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`fk_laboratorio`) REFERENCES `laboratorio` (`id_Laboratorio`),
  CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `reserva_ibfk_3` FOREIGN KEY (`fk_aulas`) REFERENCES `disciplina` (`id_disciplina`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (3,'08:00:00','2025-09-01',1,'Aula prática',2,2),(4,'08:00:00','2025-08-30',NULL,'Aula prática',2,2),(6,'08:00:00','2025-09-01',1,'Desenvolvimento do projeto',2,3),(7,'08:00:00','2025-09-01',1,'Desenvolvimento do projeto',2,3),(15,'08:00:00','2025-08-31',1,'Projeto',2,3),(18,'08:00:00','2025-08-31',1,'Projeto 1',4,3),(19,'08:00:00','2025-08-31',1,'Projeto',4,3),(21,'11:40:00','2025-08-31',1,'Oloco',2,3),(23,'08:50:00','2025-08-31',1,'Ioa',6,2),(24,'10:50:00','2025-08-31',1,'Everton',3,2),(25,'10:50:00','2025-08-31',1,'Desenvolvimento de everton',5,2),(26,'08:00:00','2025-09-01',2,'Pesquisaaa',4,6),(28,'13:30:00','2025-09-01',2,'Fazer seminario',3,6),(29,'11:40:00','2025-09-02',7,'Fazer o projeto do labcontrol',3,7),(30,'10:50:00','2025-09-01',7,'LabControl ',3,7);
/*!40000 ALTER TABLE `reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `cargo` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `senha` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'otavio','Auxiliar_Docente','otabrue6@gmail.com','$2b$10$UdxgxQJr7N2iqNXsiq0Up.lf0hAhM/qSOS1Ma558sa44bhjaTYVBe'),(2,'Everton','Professor','evy@gmail.com','$2b$10$9RbUmVJ.izwuKx1xHjLm6OSaxA.8OxUJ6ON1OjGJ9yJBzSXi5k3Ly'),(3,'Elza','Professor','elza@gmail.com','$2b$10$ZRYDU3ZiJmi7nDhOXqtgo.ZVThwkViW8ELPBI6umu3Arjd.tBTV6C'),(4,'Marcelo','Coordenador','marcelo@gmail.com','$2b$10$Xrr7ohsxTTo3YqQprv.fWuN2dpsnJ25G04W1OlBlPTVTU40uiIUVW'),(5,'Elisângela','Coordenador','eli@gmail.com','$2b$10$yCIR7LMQo6aSm99yY2B6puQ2yeRi.6j98mFR3tP8BqSPC3s9lJsyq'),(6,'Fidelis','Professor','fid@gmail.com','$2b$10$RnCyyh63.wmbBQUXWV1tM.GlogbqJ12GrUbpm.f/b6rl2upnsWzzm'),(7,'Paulinho','Professor','paulinho@gmail.com','$2b$10$XnFeFIrb7XhD8Z2NQ7LFX.Nbjx.zOmfrz4n56gqYigrneGnkYUhKq');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'lab_control'
--

--
-- Dumping routines for database 'lab_control'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-01 21:45:18
