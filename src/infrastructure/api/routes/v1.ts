import { Router } from 'express';
import { apiRoot } from '../../../config';
import selectorRoutes from './selector-routes';

const v1Router = Router();

v1Router.get('/', (req, res) => res.json({ message: "Yo! We're up!" }));

v1Router.use(`/${apiRoot}/selector`, selectorRoutes);

export default v1Router;
