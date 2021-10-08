import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { ISelectorRepository } from './i-selector-repository';
import { buildSelectorDto, SelectorDto } from './selector-dto';
import { Selector } from '../entities/selector';

export interface ReadSelectorRequestDto {
  id: string;
}

export interface ReadSelectorAuthDto {
  organizationId: string;
}

export type ReadSelectorResponseDto = Result<SelectorDto | null>;

export class ReadSelector
  implements
    IUseCase<
      ReadSelectorRequestDto,
      ReadSelectorResponseDto,
      ReadSelectorAuthDto
    >
{
  #selectorRepository: ISelectorRepository;

  public constructor(selectorRepository: ISelectorRepository) {
    this.#selectorRepository = selectorRepository;
  }

  public async execute(
    request: ReadSelectorRequestDto,
    auth: ReadSelectorAuthDto
  ): Promise<ReadSelectorResponseDto> {
    try {
      const selector: Selector | null = await this.#selectorRepository.findOne(
        request.id
      );
      if (!selector)
        throw new Error(`Selector with id ${request.id} does not exist`);

      if (selector.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      return Result.ok<SelectorDto>(buildSelectorDto(selector));
    } catch (error: any) {
      return Result.fail<SelectorDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
