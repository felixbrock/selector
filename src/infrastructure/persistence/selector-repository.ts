import fs from 'fs';
import path from 'path';
import { Selector, SelectorProperties } from '../../domain/entities';
import ISelectorRepository from '../../domain/selector/i-selector-repository';
import { Alert } from '../../domain/value-types';
import Result from '../../domain/value-types/transient-types';

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
  public async findById (id: string): Promise<Selector | null> {
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
  };

  public async findByContent (content: string): Promise<Selector | null> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result = db.selectors.find(
      (selectorEntity: { content: string }) =>
        selectorEntity.content === content
    );

    if (!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  };

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
  public async delete(id: string) : Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      const selectors: SelectorPersistence[] = db.selectors.filter(
        (selectorEntity: { id: string }) =>
          selectorEntity.id !== id
      );

      if (selectors.length === db.selectors.length)
        throw new Error(
          `Subscription with id ${id} does not exist`
        );

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

  #toEntity = (selectorProperties: SelectorProperties): Selector | null =>
    Selector.create(selectorProperties).value || null;

  #buildProperties = (selector: SelectorPersistence): SelectorProperties => ({
    id: selector.id,
    content: selector.content,
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts.map((alert) => {
      const alertResult = Alert.create();
      if (alertResult.value) return alertResult.value;
      throw new Error(
        alertResult.error || `Creation of selector alert ${alert} failed`
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
