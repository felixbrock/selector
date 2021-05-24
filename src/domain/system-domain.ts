import { AddSystem } from './add-system';

export default class SystemDomain {
  #addSystem: AddSystem;

  public get addSystem(): AddSystem {
    return this.#addSystem;
  }

  constructor(addSystem: AddSystem) {
    this.#addSystem = addSystem;
  }
}
