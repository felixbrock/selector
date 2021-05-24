import { InjectionMode, asClass, createContainer } from 'awilix';
import { AddSelector } from '../domain/add-selector';
import { AddSystem } from '../domain/add-system';
import AddSelectorRepository from './persistence/add-selector-repository';
import AddSystemRepository from './persistence/add-system-repository';
import SelectorDomain from '../domain/selector-domain';
import SystemDomain from '../domain/system-domain';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  selectorDomain: asClass(SelectorDomain),

  systemDomain: asClass(SystemDomain),

  addSelector: asClass(AddSelector),

  addSystem: asClass(AddSystem),

  addSelectorRepository: asClass(AddSelectorRepository),

  addSystemRepository: asClass(AddSystemRepository)
});

const selectorMain = iocRegister.resolve<SelectorDomain>('selectorDomain');

const systemMain = iocRegister.resolve<SystemDomain>('systemDomain');

export default {
  selectorMain,
  systemMain,
  container: iocRegister,
};
