import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import ISelectorRepository from './i-selector-repository';
import SelectorDto from './selector-dto';
import { Selector } from '../entities';

export interface ReadSelectorRequestDto {
  id: string;
}

export type ReadSelectorResponseDto = Result<SelectorDto | null>;

export class ReadSelector
  implements IUseCase<ReadSelectorRequestDto, ReadSelectorResponseDto>
{
  #selectorRepository: ISelectorRepository;

  public constructor(selectorRepository: ISelectorRepository) {
    this.#selectorRepository = selectorRepository;
  }

  public async execute(
    request: ReadSelectorRequestDto
  ): Promise<ReadSelectorResponseDto> {
    try {
      const selector: Selector | null =
        await this.#selectorRepository.findById(request.id);
      if (!selector)
        return Result.fail<null>(
          `Selector with id ${request.id} does not exist`
        );

      return Result.ok<SelectorDto>(selector);
    } catch (error) {
      return Result.fail<SelectorDto>(error.message);
    }
  }
}
