import { AddSelector } from '../use-cases/add-selector';
import { ReadSelector } from '../use-cases/read-selector';

export default class SelectorDomain {
  #addSelector: AddSelector;

  #readSelector: ReadSelector;

  public get addSelector() : AddSelector {
    return this.#addSelector;
  }

  public get readSelector() : ReadSelector {
    return this.#readSelector;
  }

  constructor(addSelector: AddSelector, readSelector: ReadSelector) {
    this.#addSelector = addSelector;
    this.#readSelector = readSelector;
  }
}
