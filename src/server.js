import express from 'express';
import routes from './routes/routes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeDatabase } from './config/Database.js';

// const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', routes);

initializeDatabase().then(() => {
    app.listen(process.env.SERVER_PORT, () => {
        console.log(`Servidor rodando na porta ${process.env.SERVER_PORT}`);
    });
}).catch(err => {
    console.error("Erro ao inicializar o banco de dados:", err);
});
