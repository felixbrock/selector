import IUseCase from '../shared';
import { Result } from '../entities/value-types';

export interface ReadSystemRequestDto {
  id: string;
}

export type ReadSystemResponseDto = Result<ReadSystemDto | null>;

export interface ReadSystemDto {
  id: string;
  name: string;
  modifiedOn: number;
  createdOn: number;
}

export interface IReadSystemRepository {
  findById(system: string): Promise<ReadSystemDto | null>;
}

export class ReadSystem
  implements IUseCase<ReadSystemRequestDto, ReadSystemResponseDto>
{
  #readSystemRepository: IReadSystemRepository;

  public constructor(readSystemRepository: IReadSystemRepository) {
    this.#readSystemRepository = readSystemRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: ReadSystemRequestDto
  ): Promise<ReadSystemResponseDto> {
    try {
      const readSystemDto: ReadSystemDto | null =
        await this.#readSystemRepository.findById(
          request.id
        );
      if (!readSystemDto)
        return Result.fail<null>(
          `System with id ${request.id} does not exist.`
        );

      return Result.ok<ReadSystemDto>(
        readSystemDto
      );
    } catch (error) {
      return Result.fail<ReadSystemDto>(error.message);
    }
  }
}
