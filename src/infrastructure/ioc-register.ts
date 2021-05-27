import { InjectionMode, asClass, createContainer } from 'awilix';

import { AddSelector } from '../domain/use-cases/add-selector';
import { AddSystem } from '../domain/use-cases/add-system';
import { ReadSelector } from '../domain/use-cases/read-selector';
import { ReadSystem } from '../domain/use-cases/read-system';

import AddSelectorRepository from './persistence/add-selector-repository';
import AddSystemRepository from './persistence/add-system-repository';
import ReadSelectorRepository from './persistence/read-selector-repository';
import ReadSystemRepository from './persistence/read-system-repository';

import SelectorDomain from '../domain/domains/selector-domain';
import SystemDomain from '../domain/domains/system-domain';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  selectorDomain: asClass(SelectorDomain),
  systemDomain: asClass(SystemDomain),

  addSelector: asClass(AddSelector),
  addSystem: asClass(AddSystem),
  readSelector: asClass(ReadSelector),
  readSystem: asClass(ReadSystem),

  addSelectorRepository: asClass(AddSelectorRepository),
  addSystemRepository: asClass(AddSystemRepository),
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
