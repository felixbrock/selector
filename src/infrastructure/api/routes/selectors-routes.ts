import { Router } from 'express';
import app from '../../ioc-register';
import SelectorDomain from '../../../domain/selector-domain';
import DeleteSelectorsController from '../controllers/delete-selectors-controller';
import ReadSelectorsController from '../controllers/read-selectors-controller';

const selectorsRoutes = Router();
const selectorDomain: SelectorDomain = app.selectorMain;

const deleteSelectorsController = new DeleteSelectorsController(
  selectorDomain.deleteSelectors,
  app.container.resolve('getAccounts')
);

const readSelectorsController = new ReadSelectorsController(
  selectorDomain.readSelectors,
  app.container.resolve('getAccounts')
);

selectorsRoutes.get('/', (req, res) =>
  readSelectorsController.execute(req, res)
);

selectorsRoutes.delete('/', (req, res) =>
  deleteSelectorsController.execute(req, res)
);

export default selectorsRoutes;
