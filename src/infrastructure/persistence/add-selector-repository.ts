// TODO - Flat File System
import fs from 'fs';
import path from 'path';
import {
  AddSelectorDto,
  IAddSelectorRepository,
} from '../../domain/add-selector';
import { Selector } from '../../domain/entities/reference-types';

export default class AddSelectorRepositoryImpl
  implements IAddSelectorRepository
{
  public findBySelector = async (
    selector: string
  ): Promise<AddSelectorDto | null> => {
    const data: string = fs.readFileSync(path.resolve(__dirname, './db.json'), 'utf-8');
    const db = JSON.parse(data);

    const result = db.selectors.find(
      (selectorEntity: { selector: string }) =>
        selectorEntity.selector === selector
    );

    return result || null;
  };

  public async save(selector: Selector): Promise<void> {
    const data: string = fs.readFileSync(path.resolve(__dirname, './db.json'), 'utf-8');
    const db = JSON.parse(data);

    db.selectors.push(this.#toPersistence(selector));

    fs.writeFileSync(path.resolve(__dirname, './db.json'), JSON.stringify(db), 'utf-8');
  }

  #toPersistence = (selector: Selector): AddSelectorDto => ({
    id: selector.id,
    systemId: selector.systemId,
    selector: selector.selector,
    createdOn: selector.createdOn,
    modifiedOn: selector.modifiedOn,
  });
}
