import { Result } from '../value-types';

export interface SelectorProps {
  id: string;
  systemId: string;
  content: string;
}

export class Selector {
  #createdOn: number;

  #id: string;

  #modifiedOn: number;

  #content: string;

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

  public get content(): string {
    return this.#content;
  }

  public get systemId(): string {
    return this.#systemId;
  }

  private constructor(props: SelectorProps) {
    this.#createdOn = Date.now();
    this.#id = props.id;
    this.#modifiedOn = Date.now();
    this.#content = props.content;
    this.#systemId = props.systemId;
  }

  public static create(props: SelectorProps): Result<Selector | null> {
    if (!props.content) return Result.fail<null>('Selector must have content');
    if (!props.systemId) return Result.fail<null>('Selector must have system id');
    if (!props.id) return Result.fail<null>('Selector must have id');
    // TODO move source logic to controller layer

    const selector = new Selector(props);
    return Result.ok<Selector>(selector);
  }
}
