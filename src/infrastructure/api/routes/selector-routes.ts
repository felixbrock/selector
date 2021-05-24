import { Router } from 'express';
import AddSelectorController from '../controllers';
import app from '../../ioc-register';
import SelectorDomain from '../../../domain/selector-domain';

const selectorRoutes = Router();
const selectorDomain: SelectorDomain = app.selectorMain;
const addSelectorController = new AddSelectorController(
  selectorDomain.addSelector
);

selectorRoutes.post('/', (req, res) => addSelectorController.execute(req, res));

export default selectorRoutes;
