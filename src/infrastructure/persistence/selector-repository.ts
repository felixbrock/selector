import fs from 'fs';
import path from 'path';
import { Selector, SelectorProperties } from '../../domain/entities/selector';
import {
  ISelectorRepository,
  AlertQueryDto,
  SelectorQueryDto,
} from '../../domain/selector/i-selector-repository';
import { Alert } from '../../domain/value-types/alert';
import Result from '../../domain/value-types/transient-types/result';

interface AlertPersistence {
  createdOn: number;
}

interface SelectorPersistence {
  id: string;
  content: string;
  systemId: string;
  alerts: AlertPersistence[];
  modifiedOn: number;
  // eslint-disable-next-line semi
}

export default class SelectorRepositoryImpl implements ISelectorRepository {
  public async findOne(id: string): Promise<Selector | null> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result: SelectorPersistence = db.selectors.find(
      (selectorEntity: { id: string }) => selectorEntity.id === id
    );

    if (!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  }

  public async findBy(selectorQueryDto: SelectorQueryDto): Promise<Selector[]> {
    if (!Object.keys(selectorQueryDto).length) return this.all();

    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const selectors: SelectorPersistence[] = db.selectors.filter(
      (selectorEntity: SelectorPersistence) =>
        this.findByCallback(selectorEntity, selectorQueryDto)
    );

    if (!selectors || !selectors.length) return [];
    return selectors.map((selector: SelectorPersistence) =>
      this.#toEntity(this.#buildProperties(selector))
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private findByCallback(
    selectorEntity: SelectorPersistence,
    selectorQueryDto: SelectorQueryDto
  ): boolean {
    const contentMatch = selectorQueryDto.content
      ? selectorEntity.content === selectorQueryDto.content
      : true;
    const systemIdMatch = selectorQueryDto.systemId
      ? selectorEntity.systemId === selectorQueryDto.systemId
      : true;
      const modifiedOnStartMatch = selectorQueryDto.modifiedOnStart
      ? selectorEntity.modifiedOn >= selectorQueryDto.modifiedOnStart
      : true;
      const modifiedOnEndMatch = selectorQueryDto.modifiedOnEnd
      ? selectorEntity.modifiedOn <= selectorQueryDto.modifiedOnEnd
      : true;

    let alertMatch: boolean;
    if (selectorQueryDto.alert === true) {
      const queryTarget: AlertQueryDto = selectorQueryDto.alert;
      const result: AlertPersistence | undefined = selectorEntity.alerts.find(
        (alert: AlertPersistence) => {
          const createdOnStartMatch = queryTarget.createdOnStart
          ? alert.createdOn >= queryTarget.createdOnStart
          : true;
          const createdOnEndMatch = queryTarget.createdOnEnd
          ? alert.createdOn <= queryTarget.createdOnEnd
          : true;

          return createdOnStartMatch && createdOnEndMatch;
        }
          
      );
      alertMatch = !!result;
    } else alertMatch = true;

    return contentMatch && systemIdMatch && modifiedOnStartMatch && modifiedOnEndMatch && alertMatch;
  }

  public async all(): Promise<Selector[]> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const { selectors } = db;

    if (!selectors || !selectors.length) return [];
    return selectors.map((selector: SelectorPersistence) =>
      this.#toEntity(this.#buildProperties(selector))
    );
  }

  public async save(selector: Selector): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      db.selectors.push(this.#toPersistence(selector));

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  public async update(selector: Selector): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      for (let i = 0; i < db.selectors.length; i += 1) {
        if (db.selectors[i].id === selector.id) {
          db.selectors[i] = this.#toPersistence(selector);
          break;
        }
      }

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async delete(id: string): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      const selectors: SelectorPersistence[] = db.selectors.filter(
        (selectorEntity: { id: string }) => selectorEntity.id !== id
      );

      if (selectors.length === db.selectors.length)
        throw new Error(`Selector with id ${id} does not exist`);

      db.selectors = selectors;

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #toEntity = (selectorProperties: SelectorProperties): Selector => {
    const createSelectorResult: Result<Selector> =
      Selector.create(selectorProperties);

    if (createSelectorResult.error) throw new Error(createSelectorResult.error);
    if (!createSelectorResult.value)
      throw new Error('Selector creation failed');

    return createSelectorResult.value;
  };

  #buildProperties = (selector: SelectorPersistence): SelectorProperties => ({
    id: selector.id,
    content: selector.content,
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts.map((alert) => {
      const alertResult = Alert.create({ createdOn: alert.createdOn });
      if (alertResult.value) return alertResult.value;
      throw new Error(
        alertResult.error || `Creation of selector alert failed`
      );
    }),
  });

  #toPersistence = (selector: Selector): SelectorPersistence => ({
    id: selector.id,
    content: selector.content,
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts.map(
      (alert): AlertPersistence => ({
        createdOn: alert.createdOn,
      })
    ),
  });
}
