# Roadmap – Backend LabControl

## 1. Modelagem inicial
- Laboratório: id, nome, capacidade, status (ativo/inativo)
- Usuário: id, nome, email, senha, papel (professor, coordenador, auxiliar)
- Turma: id, nome, disciplina, professor_id
- Agendamento: id, laboratorio_id, turma_id, data, hora_inicio, hora_fim, tipo (fixo/agendado), criado_por

## 2. Banco de dados
- Criar migrations ou scripts SQL para as tabelas acima
- Popular com dados de exemplo

## 3. Endpoints principais
- CRUD Laboratório
- CRUD Turma
- CRUD Usuário (com autenticação)
- CRUD Agendamento
- Consulta de disponibilidade de laboratório por data/intervalo
- Agendar laboratório (apenas se vago)
- Desagendar horário

## 4. Regras de negócio
- Não permitir dois agendamentos no mesmo laboratório/horário
- Permissões: professor só agenda/desagenda suas turmas; coordenador pode tudo; auxiliar tem permissões limitadas
- Horários fixos (ex.: toda segunda 10h-12h) e agendados (eventuais)

## 5. Autenticação e segurança
- Implementar login (JWT)
- Middleware de autorização por papel
- Hash de senha (bcrypt)

## 6. Validações e utilidades
- Validação de horários (interseção, formato, timezone)
- Normalização de datas/horas

## 7. Testes
- Testes unitários dos utilitários e regras
- Testes de integração das rotas principais

## 8. Documentação
- Atualizar README com exemplos de uso das rotas
- Documentar variáveis de ambiente e dependências

## 9. Extras (futuro)
- Logs de auditoria (quem agendou/desagendou)
- Exportação de horários (CSV/PDF)
- Notificações (email, push)

---
Sugestão: siga a ordem acima, mas adapte conforme as necessidades do projeto. Marque o que já foi feito e o que está em andamento!
