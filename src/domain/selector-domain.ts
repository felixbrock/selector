import { AddSelector } from './add-selector';

export default class SelectorDomain {
  #addSelector: AddSelector;

  public get addSelector() : AddSelector {
    return this.#addSelector;
  }

  constructor(addSelector: AddSelector) {
    this.#addSelector = addSelector;
  }
}
