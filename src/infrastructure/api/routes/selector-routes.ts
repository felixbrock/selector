import { Router } from 'express';
import { AddSelectorController, ReadSelectorController } from '../controllers';
import app from '../../ioc-register';
import SelectorDomain from '../../../domain/domains/selector-domain';

const selectorRoutes = Router();
const selectorDomain: SelectorDomain = app.selectorMain;

const addSelectorController = new AddSelectorController(
  selectorDomain.addSelector
);
const readSelectorController = new ReadSelectorController(
  selectorDomain.readSelector
);

selectorRoutes.post('/', (req, res) => addSelectorController.execute(req, res));

selectorRoutes.get('/:id', (req, res) => readSelectorController.execute(req, res));

export default selectorRoutes;
