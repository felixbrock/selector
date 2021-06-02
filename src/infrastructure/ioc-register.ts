import { InjectionMode, asClass, createContainer } from 'awilix';

import { CreateSelector } from '../domain/use-cases/create-selector';
import { CreateSystem } from '../domain/use-cases/create-system';
import { ReadSelector } from '../domain/use-cases/read-selector';
import { ReadSystem } from '../domain/use-cases/read-system';

import CreateSelectorRepository from './persistence/create-selector-repository';
import CreateSystemRepository from './persistence/create-system-repository';
import ReadSelectorRepository from './persistence/read-selector-repository';
import ReadSystemRepository from './persistence/read-system-repository';

import SelectorDomain from '../domain/domains/selector-domain';
import SystemDomain from '../domain/domains/system-domain';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  selectorDomain: asClass(SelectorDomain),
  systemDomain: asClass(SystemDomain),

  createSelector: asClass(CreateSelector),
  createSystem: asClass(CreateSystem),
  readSelector: asClass(ReadSelector),
  readSystem: asClass(ReadSystem),

  createSelectorRepository: asClass(CreateSelectorRepository),
  createSystemRepository: asClass(CreateSystemRepository),
  readSelectorRepository: asClass(ReadSelectorRepository),
  readSystemRepository: asClass(ReadSystemRepository),
});

const selectorMain = iocRegister.resolve<SelectorDomain>('selectorDomain');

const systemMain = iocRegister.resolve<SystemDomain>('systemDomain');

export default {
  selectorMain,
  systemMain,
  container: iocRegister,
};
