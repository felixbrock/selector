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
import { DeleteSubscriptions } from '../domain/automation-api/delete-subscriptions';
import AutomationApiRepository from './persistence/automation-api-repository';
import { ReadSelectors } from '../domain/selector/read-selectors';
import { DeleteSelectors } from '../domain/selector/delete-selectors';
import { GetAccounts } from '../domain/account-api/get-accounts';
import AccountApiRepository from './persistence/account-api-repository';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  selectorDomain: asClass(SelectorDomain),

  createSelector: asClass(CreateSelector),
  updateSelector: asClass(UpdateSelector),
  readSelector: asClass(ReadSelector),
  readSelectors: asClass(ReadSelectors),
  deleteSelector: asClass(DeleteSelector),
  deleteSelectors: asClass(DeleteSelectors),

  createAlert: asClass(CreateAlert),

  deleteSubscriptions: asClass(DeleteSubscriptions),

  getSystem: asClass(GetSystem),
  postWarning: asClass(PostWarning),
  getAccounts: asClass(GetAccounts),

  selectorRepository: asClass(SelectorRepository),

  automationApiRepository: asClass(AutomationApiRepository),
  systemApiRepository: asClass(SystemApiRepository),
  accountApiRepository: asClass(AccountApiRepository),
});

const selectorMain = iocRegister.resolve<SelectorDomain>('selectorDomain');

export default {
  selectorMain,
  container: iocRegister,
};
