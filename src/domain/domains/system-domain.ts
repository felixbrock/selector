import { AddSystem } from '../use-cases/add-system';
import { ReadSystem } from '../use-cases/read-system';

export default class SystemDomain {
  #addSystem: AddSystem;
  
  #readSystem: ReadSystem;

  public get addSystem(): AddSystem {
    return this.#addSystem;
  }

  public get readSystem() : ReadSystem {
    return this.#readSystem;
  }

  constructor(addSystem: AddSystem, readSystem : ReadSystem) {
    this.#addSystem = addSystem;
    this.#readSystem = readSystem;
  }
}
