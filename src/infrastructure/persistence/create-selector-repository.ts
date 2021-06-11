import fs from 'fs';
import path from 'path';
import {
  CreateSelectorDto,
  ICreateSelectorRepository,
} from '../../domain/use-cases/create-selector';
import { Selector } from '../../domain/entities';

export default class CreateSelectorRepositoryImpl
  implements ICreateSelectorRepository
{
  public findByContent = async (
    content: string
  ): Promise<CreateSelectorDto | null> => {
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

  #toPersistence = (selector: Selector): CreateSelectorDto => ({
    id: selector.id,
    systemId: selector.systemId,
    content: selector.content,
    createdOn: selector.createdOn,
    modifiedOn: selector.modifiedOn,
  });
}
