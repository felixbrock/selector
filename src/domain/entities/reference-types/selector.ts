import { Result } from '../value-types';

export interface SelectorProps {
  id: string;
  system: string;
  selector: string;
  modifiedOn?: number;
  createdOn?: number;
};

export class Selector {
  #createdOn: number;

  #id: string;

  #modifiedOn: number;

  #selector: string;

  #system: string;

  public get createdOn(): number {
    return this.#createdOn;
  }

  public get id(): string {
    return this.#id;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public get selector(): string {
    return this.#selector;
  }

  public get system(): string {
    return this.#system;
  }

  private constructor(props: SelectorProps) {
    this.#createdOn = props.createdOn || Date.now();
    this.#id = props.id;
    this.#modifiedOn = props.modifiedOn || Date.now();
    this.#selector = props.selector;
    this.#system = props.system;
  }

  public static create(props: SelectorProps): Result<Selector> {
    if (!props.selector) return Result.fail('Selector must have selector');
    if (!props.system) return Result.fail('Selector must have system');
    if (!props.id) return Result.fail('Selector must have id');
    // TODO move source logic to controller layer

    const selector = new Selector(props);
    return Result.ok<Selector>(selector);
  }
}