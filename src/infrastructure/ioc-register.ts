import { InjectionMode, asClass, createContainer } from 'awilix';

import SelectorDomain from '../domain/selector-domain';
import { CreateSelector } from '../domain/selector/create-selector';
import { ReadSelector } from '../domain/selector/read-selector';
import { CreateAlert } from '../domain/alert/create-alert';
import { GetSystem } from '../domain/system-api/get-system';
import SelectorRepository from './persistence/selector-repository';
import { UpdateSelector } from '../domain/selector/update-selector';
import SystemApiRepository from './persistence/system-api-repository';
import { PostWarning } from '../domain/system-api/post-warning';
import { DeleteSelector } from '../domain/selector/delete-selector';
import { DeleteTargets } from '../domain/subscription-api/delete-targets';
import SubscriptionApiRepository from './persistence/subscription-api-repository';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  selectorDomain: asClass(SelectorDomain),

  createSelector: asClass(CreateSelector),
  updateSelector: asClass(UpdateSelector),
  readSelector: asClass(ReadSelector),
  deleteSelector: asClass(DeleteSelector),

  createAlert: asClass(CreateAlert),

  deleteTargets: asClass(DeleteTargets),

  getSystem: asClass(GetSystem),
  postWarning: asClass(PostWarning),

  selectorRepository: asClass(SelectorRepository),

  subscriptionApiRepository: asClass(SubscriptionApiRepository),
  systemApiRepository: asClass(SystemApiRepository),
});

const selectorMain = iocRegister.resolve<SelectorDomain>('selectorDomain');

export default {
  selectorMain,
  container: iocRegister,
};
