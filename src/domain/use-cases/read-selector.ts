import { IUseCase, Result } from '../shared';


export interface ReadSelectorRequestDto {
  id: string;
}

export interface ReadSelectorDto {
  id: string;
  content: string;
  systemId: string;
  modifiedOn: number;
  createdOn: number;
}

export type ReadSelectorResponseDto = Result<ReadSelectorDto | null>;

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

  public async execute(
    request: ReadSelectorRequestDto
  ): Promise<ReadSelectorResponseDto> {
    try {
      const readSelectorResult: ReadSelectorDto | null =
        await this.#readSelectorRepository.findById(
          request.id
        );
      if (!readSelectorResult)
        return Result.fail<null>(
          `Selector with id ${request.id} does not exist.`
        );

      return Result.ok<ReadSelectorDto>(
        readSelectorResult
      );
    } catch (error) {
      return Result.fail<ReadSelectorDto>(error.message);
    }
  }
}
