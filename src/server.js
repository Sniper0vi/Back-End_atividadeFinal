import express from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import { initializeDatabase } from './config/Database.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', routes);

(async () => {
    try {
        await initializeDatabase();
        app.listen(process.env.SERVER_PORT, () => {
            console.log(`Servidor rodando em: http://localhost:${process.env.SERVER_PORT}`);
        });
    } catch (error) {
        console.error('Falha ao inicializar o banco de dados:', error);
        process.exit(1);
    }
})();
