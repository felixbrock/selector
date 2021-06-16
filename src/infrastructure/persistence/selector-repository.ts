import fs from 'fs';
import path from 'path';
import { Selector, SelectorProperties } from '../../domain/entities';
import ISelectorRepository from '../../domain/selector/i-selector-repository';
import { Alert } from '../../domain/value-types';

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
  public findById = async (id: string): Promise<Selector | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result: SelectorPersistence = db.selectors.find(
      (selectorEntity: { id: string }) => selectorEntity.id === id
    );
    
    if(!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  };

  public findByContent = async (content: string): Promise<Selector | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result = db.selectors.find(
      (selectorEntity: { content: string }) => selectorEntity.content === content
    );

    if(!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  };

  public async save(selector: Selector): Promise<void> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    db.selectors.push(this.#toPersistence(selector));

    fs.writeFileSync(
      path.resolve(__dirname, '../../../db.json'),
      JSON.stringify(db),
      'utf-8'
    );
  }

  public async update(selector: Selector): Promise<void> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

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
