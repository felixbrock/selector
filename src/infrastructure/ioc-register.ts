import { InjectionMode, asClass, createContainer } from 'awilix';

import { CreateSelector } from '../domain/use-cases/create-selector';
import { ReadSelector } from '../domain/use-cases/read-selector';
import { GetSystem } from '../domain/use-cases/get-system';

import CreateSelectorRepository from './persistence/create-selector-repository';
import ReadSelectorRepository from './persistence/read-selector-repository';
import GetSystemRepository from './persistence/get-system-repository';

import SelectorDomain from '../domain/selector-domain';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  selectorDomain: asClass(SelectorDomain),

  createSelector: asClass(CreateSelector),
  readSelector: asClass(ReadSelector),
  getSystem: asClass(GetSystem),

  createSelectorRepository: asClass(CreateSelectorRepository),
  readSelectorRepository: asClass(ReadSelectorRepository),

  getSystemRepository: asClass(GetSystemRepository),
});

const selectorMain = iocRegister.resolve<SelectorDomain>('selectorDomain');

export default {
  selectorMain,
  container: iocRegister,
};
