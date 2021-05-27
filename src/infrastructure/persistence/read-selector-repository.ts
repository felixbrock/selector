import fs from 'fs';
import path from 'path';
import {
  ReadSelectorDto,
  IReadSelectorRepository,
} from '../../domain/use-cases/read-selector';

export default class ReadSelectorRepositoryImpl
  implements IReadSelectorRepository
{
  public findById = async (id: string): Promise<ReadSelectorDto | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result = db.selectors.find(
      (selectorEntity: { id: string }) => selectorEntity.id === id
    );

    return result || null;
  };
}
