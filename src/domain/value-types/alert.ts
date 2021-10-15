
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

  public static create = (properties: AlertProperties): Alert =>
    new Alert(properties);
}
