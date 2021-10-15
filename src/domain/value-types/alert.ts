import Result from './transient-types/result';

export interface AlertProperties {
  createdOn?: number;
}

export class Alert {
  #createdOn: number;

  public get createdOn(): number {
    return this.#createdOn;
  }

  private constructor(properties: AlertProperties) {
    this.#createdOn = properties.createdOn || Date.now();
  }

  public static create(properties: AlertProperties): Result<Alert> {
    const alert = new Alert(properties);
    return Result.ok(alert);
  }
}
