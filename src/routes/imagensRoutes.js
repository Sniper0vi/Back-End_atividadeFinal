import {Router} from 'express';
import imagensController from '../controllers/imagensController.js';
const imagensRoutes = Router();

imagensRoutes.get('/:id', imagensController.selecionar);

export default imagensRoutes;
