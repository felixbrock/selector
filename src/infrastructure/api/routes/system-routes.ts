import { Router } from 'express';
import { AddSystemController, ReadSystemController } from '../controllers';
import app from '../../ioc-register';
import SystemDomain from '../../../domain/domains/system-domain';

const systemRoutes = Router();
const systemDomain: SystemDomain = app.systemMain;

const addSystemController = new AddSystemController(systemDomain.addSystem);
const readSystemController = new ReadSystemController(systemDomain.readSystem);

systemRoutes.post('/', (req, res) => addSystemController.execute(req, res));

systemRoutes.get('/:id', (req, res) => readSystemController.execute(req, res));

export default systemRoutes;
