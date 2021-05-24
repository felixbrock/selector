import { Router } from 'express';
import { apiRoot } from '../../../config';
import selectorRoutes from './selector-routes';
import systemRoutes from './system-routes';


const version = 'v1';

const v1Router = Router();

v1Router.get('/', (req, res) => res.json({ message: "Yo! We're up!" }));

v1Router.use(`/${apiRoot}/${version}/selector`, selectorRoutes);

v1Router.use(`/${apiRoot}/${version}/system`, systemRoutes);

export default v1Router;
