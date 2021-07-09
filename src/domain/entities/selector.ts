import { Alert } from '../value-types/alert';
import Result from '../value-types/transient-types/result';

export interface SelectorProperties {
  id: string;
  systemId: string;
  content: string;
  modifiedOn?: number;
  alerts?: Alert[];
}

export class Selector {
  #id: string;

  #modifiedOn: number;

  #content: string;

  #systemId: string;

  #alerts: Alert[];

  public get id(): string {
    return this.#id;
  }

  public get content(): string {
    return this.#content;
  }

  public set content(content: string){
    if (!content) throw new Error('Selector content cannot be null');

    this.#content = content;
  }

  public get systemId(): string {
    return this.#systemId;
  }

  public get alerts(): Alert[] {
    return this.#alerts;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: SelectorProperties) {
    this.#id = properties.id;
    this.#content = properties.content;
    this.#systemId = properties.systemId;
    this.#alerts = properties.alerts || [];
    this.#modifiedOn = properties.modifiedOn || Date.now();
  }

  public static create(
    properties: SelectorProperties
  ): Result<Selector> {
    if (!properties.content)
      return Result.fail<Selector>('Selector must have content');
    if (!properties.systemId)
      return Result.fail<Selector>('Selector must have system id');
    if (!properties.id) return Result.fail<Selector>('Selector must have id');

    const selector = new Selector(properties);
    return Result.ok<Selector>(selector);
  }

  public addAlert(alert: Alert): void {
    this.#alerts.push(alert);
  }
}
