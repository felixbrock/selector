import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { ISelectorRepository } from './i-selector-repository';
import { buildSelectorDto, SelectorDto } from './selector-dto';

export interface ReadSelectorRequestDto {
  id: string;
}

export interface ReadSelectorAuthDto {
  organizationId: string;
}

export type ReadSelectorResponseDto = Result<SelectorDto>;

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
      const selector = await this.#selectorRepository.findOne(request.id);
      if (!selector)
        throw new Error(`Selector with id ${request.id} does not exist`);

      if (selector.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      return Result.ok(buildSelectorDto(selector));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
