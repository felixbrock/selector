import { Router } from 'express';
import { CreateSelectorController, ReadSelectorController } from '../controllers';
import app from '../../ioc-register';
import SelectorDomain from '../../../domain/selector-domain';

const selectorRoutes = Router();
const selectorDomain: SelectorDomain = app.selectorMain;

const createSelectorController = new CreateSelectorController(
  selectorDomain.createSelector
);
const readSelectorController = new ReadSelectorController(
  selectorDomain.readSelector
);

selectorRoutes.post('/', (req, res) => createSelectorController.execute(req, res));

selectorRoutes.get('/:selectorId', (req, res) => readSelectorController.execute(req, res));

export default selectorRoutes;
