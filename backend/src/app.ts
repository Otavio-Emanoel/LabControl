import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import testRouter from './test/test.router';
import authRouter from './routes/auth.routes';
import agendamentosRouter from './routes/agendamento.routes';
import horariosFixosRouter from './routes/horariosfixos.routes'
import labsRouter from './routes/labs.routes';
import { pool } from './database/connection';

const app = express();

// habilita o cors (config simples: permite tudo)
app.use(cors());

app.use(express.json());

const port = Number(process.env.PORT) || 3000;

app.get('/', (_req, res) => {
  res.send('Rota inicial');
});

// monta as rotas de teste em /test
app.use('/test', testRouter);
// rotas de autenticação
app.use('/auth', authRouter);
//Rota para buscar e editar agendamentos
app.use("/agendamentos",agendamentosRouter)
//Rota para buscar horarios fixos
app.use("/horarios-fixos",horariosFixosRouter)
//Rota para buscar laboratórios
app.use("/labs",labsRouter)

const server = app.listen(port, () => {
  console.log(`O servidor tá rodando em http://localhost:${port}`);
});

// Encerramento gracioso para não deixar conexões abertas
async function shutdown() {
  console.log('Encerrando servidor...');
  server.close(() => console.log('Servidor HTTP encerrado.'));
  try {
    await pool.end();
    console.log('Pool do MySQL encerrado.');
  } catch (e) {
    console.error('Erro ao encerrar o pool do MySQL:', e);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);