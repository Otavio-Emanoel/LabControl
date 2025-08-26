LabControl – Backend (API)
================================================

API em Node.js/Express com TypeScript para gestão dos laboratórios de informática. Professores, coordenadores e auxiliares podem:

- Consultar disponibilidade dos laboratórios por dia/horário.
- Agendar apenas laboratórios vagos.
- Desagendar horários fixos ou previamente agendados (respeitando regras de negócio e permissões).

Estado atual: esqueleto inicial com servidor, conexão MySQL e rotas de teste. As entidades e regras de agendamento serão evoluídas.

Tecnologias
- Node.js + Express
- TypeScript
- MySQL (mysql2/promise)
- Dotenv

Requisitos
- Node.js 18+ (recomendado)
- MySQL 8+ em execução
- NPM (ou PNPM/Yarn)

Instalação
1) Instale as dependências

```powershell
npm install
```

2) Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, baseado em `.env.example`:

```env
# Porta HTTP da API
PORT=3000

# Configuração do MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=labcontrol
```

Banco de dados
- Crie o schema antes de iniciar (ex.: `CREATE DATABASE labcontrol;`).
- O projeto já cria um pool de conexões via `mysql2/promise` em `src/database/connection.ts`.
- Há uma rota de health-check do banco (veja abaixo).

Scripts NPM
- `npm run dev`: inicia em desenvolvimento com ts-node.
- `npm run build`: transpila TypeScript para `dist/`.
- `npm start`: executa a versão compilada de `dist/app.js`.
- `npm run watch`: recompila continuamente.

Como rodar
Ambiente de desenvolvimento (hot-run com ts-node):

```powershell
npm run dev
```

Build + produção local:

```powershell
npm run build ; npm start
```

Rotas disponíveis (atual)
- `GET /` → rota inicial (texto simples).
- `GET /test/health/db` → verifica conexão com o MySQL (200 ok / 500 error).
- `GET /test/now` → retorna `SELECT NOW()` do MySQL.

Estrutura do projeto (resumo)
- `src/app.ts`: bootstrap do servidor Express e montagem das rotas.
- `src/database/connection.ts`: pool e utilitários de conexão MySQL.
- `src/test/test.router.ts`: rotas de teste/health.
- `src/controllers/*`: controladores (a serem implementados).
- `src/models/*`: modelos/entidades (a serem implementados).
- `src/middleware/*`: middlewares (ex.: autenticação) – a serem implementados.
- `src/routes/*`: rotas por domínio (ex.: `teacher.routes.ts`).

Encerramento gracioso
O servidor fecha o HTTP server e encerra o pool do MySQL ao receber SIGINT/SIGTERM.

Próximas entregas (roadmap)
- Modelagem das entidades: Laboratório, Turma, Reserva/Agendamento, Usuário/Perfil.
- Regras de conflito (não permitir dois agendamentos no mesmo laboratório/horário).
- Permissões por papel (professor, coordenador, auxiliar).
- Endpoints CRUD e consultas de disponibilidade por data/intervalo.
- Autenticação e autorização (ex.: JWT) e middleware de guarda.
- Validações/normalizações de horários (fuso, interseções, etc.).

Licença
ISC (veja `package.json`).
