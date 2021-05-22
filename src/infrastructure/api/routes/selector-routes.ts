import { Router } from 'express';
import AddSelectorController from '../controllers';
import app from '../../ioc-register';
import SelectorDomain from '../../../domain/selector-domain';

const selectorRoutes = Router();
const selectorDomain: SelectorDomain = app.selectorMain;
const addCommentController = new AddSelectorController(
  selectorDomain.addSelector
);

selectorRoutes.post('/', (req, res) => addCommentController.execute(req, res));

export default selectorRoutes;
