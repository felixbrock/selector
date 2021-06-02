import { CreateSelector } from '../use-cases/create-selector';
import { ReadSelector } from '../use-cases/read-selector';

export default class SelectorDomain {
  #createSelector: CreateSelector;

  #readSelector: ReadSelector;

  public get createSelector() : CreateSelector {
    return this.#createSelector;
  }

  public get readSelector() : ReadSelector {
    return this.#readSelector;
  }

  constructor(createSelector: CreateSelector, readSelector: ReadSelector) {
    this.#createSelector = createSelector;
    this.#readSelector = readSelector;
  }
}
