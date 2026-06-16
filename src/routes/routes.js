import { Router } from 'express';
const routes = Router()
import categoriaRoutes from './categoriaRoutes.js';
import produtosRoutes from './produtosRoutes.js';
import pedidoRoutes from './pedidoRoutes.js';
import imagensRoutes from './imagensRoutes.js';


routes.use('/Categorias', categoriaRoutes);
routes.use('/Produtos', produtosRoutes);
routes.use('/Pedidos', pedidoRoutes);
routes.use('/Imagens', imagensRoutes);

export default routes;
