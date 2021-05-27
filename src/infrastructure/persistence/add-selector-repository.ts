// TODO - Flat File System
import fs from 'fs';
import path from 'path';
import {
  AddSelectorDto,
  IAddSelectorRepository,
} from '../../domain/use-cases/add-selector';
import { Selector } from '../../domain/entities/reference-types';

export default class AddSelectorRepositoryImpl
  implements IAddSelectorRepository
{
  public findByContent = async (
    content: string
  ): Promise<AddSelectorDto | null> => {
    const data: string = fs.readFileSync(path.resolve(__dirname, '../../../db.json'), 'utf-8');
    const db = JSON.parse(data);

    const result = db.selectors.find(
      (selectorEntity: { content: string }) =>
        selectorEntity.content === content
    );

    return result || null;
  };

  public async save(selector: Selector): Promise<void> {
    const data: string = fs.readFileSync(path.resolve(__dirname, '../../../db.json'), 'utf-8');
    const db = JSON.parse(data);

    db.selectors.push(this.#toPersistence(selector));

    fs.writeFileSync(path.resolve(__dirname, '../../../db.json'), JSON.stringify(db), 'utf-8');
  }

  #toPersistence = (selector: Selector): AddSelectorDto => ({
    id: selector.id,
    systemId: selector.systemId,
    content: selector.content,
    createdOn: selector.createdOn,
    modifiedOn: selector.modifiedOn,
  });
}
