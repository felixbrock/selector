import Result from './transient-types/result';

export default class Alert {
  #createdOn: number;

  public get createdOn(): number {
    return this.#createdOn;
  }

  private constructor() {
    this.#createdOn = Date.now();
  }

  public static create(): Result<Alert | null> {
    const alert = new Alert();
    return Result.ok<Alert>(alert);
  }
}
