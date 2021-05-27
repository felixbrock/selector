import IUseCase from '../shared';
import { Result } from '../entities/value-types';

export interface ReadSelectorRequestDto {
  id: string;
}

export type ReadSelectorResponseDto = Result<ReadSelectorDto | null>;

export interface ReadSelectorDto {
  id: string;
  selector: string;
  systemId: string;
  modifiedOn: number;
  createdOn: number;
}

export interface IReadSelectorRepository {
  findById(selector: string): Promise<ReadSelectorDto | null>;
}

export class ReadSelector
  implements IUseCase<ReadSelectorRequestDto, ReadSelectorResponseDto>
{
  #readSelectorRepository: IReadSelectorRepository;

  public constructor(readSelectorRepository: IReadSelectorRepository) {
    this.#readSelectorRepository = readSelectorRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: ReadSelectorRequestDto
  ): Promise<ReadSelectorResponseDto> {
    try {
      const readSelectorDto: ReadSelectorDto | null =
        await this.#readSelectorRepository.findById(
          request.id
        );
      if (!readSelectorDto)
        return Result.fail<null>(
          `Selector with id ${request.id} does not exist.`
        );

      return Result.ok<ReadSelectorDto>(
        readSelectorDto
      );
    } catch (error) {
      return Result.fail<ReadSelectorDto>(error.message);
    }
  }
}
