import { InjectionMode, asClass, createContainer } from 'awilix';



import GetSystemRepository from './persistence/get-system-repository';

import SelectorDomain from '../domain/selector-domain';
import { CreateSelector } from '../domain/selector/create-selector';
import { ReadSelector } from '../domain/selector/read-selector';
import { CreateAlert } from '../domain/alert/create-alert';
import { GetSystem } from '../domain/get-system/get-system';
import SelectorRepository from './persistence/selector-repository';
import { UpdateSelector } from '../domain/selector/update-selector';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  selectorDomain: asClass(SelectorDomain),

  createSelector: asClass(CreateSelector),
  updateSelector: asClass(UpdateSelector),
  readSelector: asClass(ReadSelector),
  createAlert: asClass(CreateAlert),

  getSystem: asClass(GetSystem),

  selectorRepository: asClass(SelectorRepository),

  getSystemRepository: asClass(GetSystemRepository),
});

const selectorMain = iocRegister.resolve<SelectorDomain>('selectorDomain');

export default {
  selectorMain,
  container: iocRegister,
};
