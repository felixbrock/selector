import { Router } from 'express';
import { CreateSelectorController, ReadSelectorController } from '../controllers';
import app from '../../ioc-register';
import SelectorDomain from '../../../domain/selector-domain';
import CreateAlertController from '../controllers/create-alert-controller';

const selectorRoutes = Router();
const selectorDomain: SelectorDomain = app.selectorMain;

const createSelectorController = new CreateSelectorController(
  selectorDomain.createSelector
);
const readSelectorController = new ReadSelectorController(
  selectorDomain.readSelector
);
const createAlertController = new CreateAlertController(
  selectorDomain.createAlert
);

selectorRoutes.post('/', (req, res) => createSelectorController.execute(req, res));

selectorRoutes.get('/:selectorId', (req, res) => readSelectorController.execute(req, res));

selectorRoutes.post('/:selectorId/alert', (req, res) => createAlertController.execute(req, res));

export default selectorRoutes;
