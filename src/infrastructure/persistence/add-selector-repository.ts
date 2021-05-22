// TODO - Flat File System
import fs from 'fs';
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
    const data: string = fs.readFileSync('./selector-db.json', 'utf-8');
    const db = JSON.parse(data);

    const result = db.selectors.find(
      (selectorElement: { selector: string }) =>
        selectorElement.selector === selector
    );

    return result || null;
  };

  public async save(selector: Selector): Promise<void> {
    const data: string = fs.readFileSync('./selector-db.json', 'utf-8');
    const db = JSON.parse(data);

    db.selector.push(this.#toPersistence(selector));

    fs.writeFileSync('./selector-db.json', 'utf-8');
  }

  #toPersistence = (selector: Selector): AddSelectorDto => ({
    id: selector.id,
    system: selector.system,
    selector: selector.selector,
    createdOn: selector.createdOn,
    modifiedOn: selector.modifiedOn,
  });
}
