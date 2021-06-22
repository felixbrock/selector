import { CreateAlert } from './alert/create-alert';
import { CreateSelector } from './selector/create-selector';
import { DeleteSelector } from './selector/delete-selector';
import { DeleteSelectors } from './selector/delete-selectors';
import { ReadSelector } from './selector/read-selector';
import { UpdateSelector } from './selector/update-selector';

export default class SelectorDomain {
  #createSelector: CreateSelector;

  #updateSelector: UpdateSelector;

  #readSelector: ReadSelector;

  #deleteSelector: DeleteSelector;

  #deleteSelectors: DeleteSelectors;

  #createAlert: CreateAlert;

  public get createSelector(): CreateSelector {
    return this.#createSelector;
  }

  public get updateSelector(): UpdateSelector {
    return this.#updateSelector;
  }

  public get readSelector(): ReadSelector {
    return this.#readSelector;
  }

  public get deleteSelector(): DeleteSelector {
    return this.#deleteSelector;
  }

  public get deleteSelectors(): DeleteSelectors {
    return this.#deleteSelectors;
  }

  public get createAlert(): CreateAlert {
    return this.#createAlert;
  }

  constructor(
    createSelector: CreateSelector,
    updateSelector: UpdateSelector,
    readSelector: ReadSelector,
    deleteSelector: DeleteSelector,
    deleteSelectors: DeleteSelectors,
    createAlert: CreateAlert
  ) {
    this.#createSelector = createSelector;
    this.#updateSelector = updateSelector;
    this.#readSelector = readSelector;
    this.#deleteSelector = deleteSelector;
    this.#deleteSelectors = deleteSelectors;
    this.#createAlert = createAlert;
  }
}
