import { v4 as uuidv4 } from 'uuid';
import IUseCase from './shared';
import { Id, Result } from './entities/value-types';
import { System, SystemProps } from './entities/reference-types';

export interface AddSystemRequestDto {
  name: string;
}

export type AddSystemResponseDto = Result<AddSystemDto | null>;

export interface AddSystemDto {
  id: string;
  name: string;
  modifiedOn: number;
  createdOn: number;
}

export interface IAddSystemRepository {
  findByName(name: string): Promise<AddSystemDto | null>;
  save(system: System): Promise<void>;
}

export class AddSystem
  implements IUseCase<AddSystemRequestDto, AddSystemResponseDto>
{
  #addSystemRepository: IAddSystemRepository;

  public constructor(addSystemRepository: IAddSystemRepository) {
    this.#addSystemRepository = addSystemRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: AddSystemRequestDto
  ): Promise<AddSystemResponseDto> {
    const system: Result<System | null> = this.#createSystem(request);
    if (!system.value) return system;

    try {
      const addSystemDto: AddSystemDto | null =
        await this.#addSystemRepository.findByName(
          system.value.name
        );
      if (addSystemDto) return Result.fail<null>(`System is already registered under ${addSystemDto.id}`);

      await this.#addSystemRepository.save(system.value);

      return Result.ok<AddSystemDto>(
        this.#buildSystemDto(system.value)
      );
    } catch (error) {
      return Result.fail<AddSystemDto>(error.message);
    }
  }

  #buildSystemDto = (system: System): AddSystemDto => ({
    id: system.id,
    name: system.name,
    createdOn: system.createdOn,
    modifiedOn: system.modifiedOn
  });

  #createSystem = (
    request: AddSystemRequestDto
  ): Result<System | null> => {
    const selectorProps: SystemProps = {
      id: Id.next(uuidv4).id,
      name: request.name
    };

    return System.create(selectorProps);
  };
}
