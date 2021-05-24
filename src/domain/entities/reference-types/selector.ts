import { Result } from '../value-types';

// TODO createdOn and modifiedOn should not be part of props 
// since they should not be provided when creating new selector
export interface SelectorProps {
  id: string;
  systemId: string;
  selector: string;
}

export class Selector {
  #createdOn: number;

  #id: string;

  #modifiedOn: number;

  #selector: string;

  #systemId: string;

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

  public get systemId(): string {
    return this.#systemId;
  }

  private constructor(props: SelectorProps) {
    this.#createdOn = Date.now();
    this.#id = props.id;
    this.#modifiedOn = Date.now();
    this.#selector = props.selector;
    this.#systemId = props.systemId;
  }

  public static create(props: SelectorProps): Result<Selector | null> {
    if (!props.selector) return Result.fail<null>('Selector must have selector');
    if (!props.systemId) return Result.fail<null>('Selector must have system id');
    if (!props.id) return Result.fail<null>('Selector must have id');
    // TODO move source logic to controller layer

    const selector = new Selector(props);
    return Result.ok<Selector>(selector);
  }
}
