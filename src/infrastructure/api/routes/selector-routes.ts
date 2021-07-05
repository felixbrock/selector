import { Router } from 'express';
import CreateSelectorController from '../controllers/create-selector-controller';
import ReadSelectorController from '../controllers/read-selector-controller';
import app from '../../ioc-register';
import SelectorDomain from '../../../domain/selector-domain';
import CreateAlertController from '../controllers/create-alert-controller';
import DeleteSelectorController from '../controllers/delete-selector-controller';

const selectorRoutes = Router();
const selectorDomain: SelectorDomain = app.selectorMain;

const createSelectorController = new CreateSelectorController(
  selectorDomain.createSelector
);
const readSelectorController = new ReadSelectorController(
  selectorDomain.readSelector
);
const deleteSelectorController = new DeleteSelectorController(
  selectorDomain.deleteSelector
);
const createAlertController = new CreateAlertController(
  selectorDomain.createAlert
);

selectorRoutes.post('/', (req, res) =>
  createSelectorController.execute(req, res)
);

selectorRoutes.get('/:selectorId', (req, res) =>
  readSelectorController.execute(req, res)
);

selectorRoutes.delete('/:selectorId', (req, res) =>
  deleteSelectorController.execute(req, res)
);

selectorRoutes.post('/:selectorId/alert', (req, res) =>
  createAlertController.execute(req, res)
);

export default selectorRoutes;
