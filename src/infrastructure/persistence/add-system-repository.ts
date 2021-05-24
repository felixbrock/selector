// TODO - Flat File System
import fs from 'fs';
import path from 'path';
import { AddSystemDto, IAddSystemRepository } from '../../domain/add-system';
import { System } from '../../domain/entities/reference-types';

export default class AddSelectorRepositoryImpl implements IAddSystemRepository {
  public findByName = async (name: string): Promise<AddSystemDto | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, './db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result = db.systems.find(
      (systemEntity: { name: string }) => systemEntity.name === name
    );

    return result || null;
  };

  public async save(system: System): Promise<void> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, './db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    db.systems.push(this.#toPersistence(system));

    fs.writeFileSync(
      path.resolve(__dirname, './db.json'),
      JSON.stringify(db),
      'utf-8'
    );
  }

  #toPersistence = (system: System): AddSystemDto => ({
    id: system.id,
    name: system.name,
    createdOn: system.createdOn,
    modifiedOn: system.modifiedOn,
  });
}
