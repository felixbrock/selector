import { v4 as uuidv4 } from 'uuid';
import IUseCase from '../shared';
import { Id, Result } from '../entities/value-types';
import { System, SystemProps } from '../entities/reference-types';

export interface CreateSystemRequestDto {
  name: string;
}

export type CreateSystemResponseDto = Result<CreateSystemDto | null>;

export interface CreateSystemDto {
  id: string;
  name: string;
  modifiedOn: number;
  createdOn: number;
}

export interface ICreateSystemRepository {
  findByName(name: string): Promise<CreateSystemDto | null>;
  save(system: System): Promise<void>;
}

export class CreateSystem
  implements IUseCase<CreateSystemRequestDto, CreateSystemResponseDto>
{
  #createSystemRepository: ICreateSystemRepository;

  public constructor(createSystemRepository: ICreateSystemRepository) {
    this.#createSystemRepository = createSystemRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: CreateSystemRequestDto
  ): Promise<CreateSystemResponseDto> {
    const system: Result<System | null> = this.#createSystem(request);
    if (!system.value) return system;

    try {
      const createSystemDto: CreateSystemDto | null =
        await this.#createSystemRepository.findByName(
          system.value.name
        );
      if (createSystemDto) return Result.fail<null>(`System is already registered under ${createSystemDto.id}`);

      await this.#createSystemRepository.save(system.value);

      return Result.ok<CreateSystemDto>(
        this.#buildSystemDto(system.value)
      );
    } catch (error) {
      return Result.fail<CreateSystemDto>(error.message);
    }
  }

  #buildSystemDto = (system: System): CreateSystemDto => ({
    id: system.id,
    name: system.name,
    createdOn: system.createdOn,
    modifiedOn: system.modifiedOn
  });

  #createSystem = (
    request: CreateSystemRequestDto
  ): Result<System | null> => {
    const selectorProps: SystemProps = {
      id: Id.next(uuidv4).id,
      name: request.name
    };

    return System.create(selectorProps);
  };
}
