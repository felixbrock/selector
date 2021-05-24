import { Router } from 'express';
import { AddSystemController } from '../controllers';
import app from '../../ioc-register';
import SystemDomain from '../../../domain/system-domain';

const systemRoutes = Router();
const systemDomain: SystemDomain = app.systemMain;
const addSystemController = new AddSystemController(systemDomain.addSystem);

systemRoutes.post('/', (req, res) => addSystemController.execute(req, res));

export default systemRoutes;
