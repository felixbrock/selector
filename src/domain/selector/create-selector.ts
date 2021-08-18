// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { Selector, SelectorProperties } from '../entities/selector';
import { SelectorDto, buildSelectorDto } from './selector-dto';
import { ISelectorRepository } from './i-selector-repository';

export interface CreateSelectorRequestDto {
  content: string;
  systemId: string;
}

export type CreateSelectorResponseDto = Result<SelectorDto | null>;

export class CreateSelector
  implements IUseCase<CreateSelectorRequestDto, CreateSelectorResponseDto>
{
  #selectorRepository: ISelectorRepository;

  public constructor(selectorRepository: ISelectorRepository) {
    this.#selectorRepository = selectorRepository;
  }

  public async execute(
    request: CreateSelectorRequestDto
  ): Promise<CreateSelectorResponseDto> {
    const selector: Result<Selector | null> = this.#createSelector(request);
    if (!selector.value) return selector;

    try {
      const readSelectorResult: SelectorDto[] =
        await this.#selectorRepository.findBy({
          content: selector.value.content,
        });
      if (readSelectorResult.length)
        throw new Error(
          `Selector ${readSelectorResult[0].content} is already registered under ${readSelectorResult[0].id}`
        );

      await this.#selectorRepository.insertOne(selector.value);

      return Result.ok<SelectorDto>(buildSelectorDto(selector.value));
    } catch (error) {
      return Result.fail<SelectorDto>(error.message);
    }
  }

  #createSelector = (
    request: CreateSelectorRequestDto
  ): Result<Selector | null> => {
    const selectorProperties: SelectorProperties = {
      id: new ObjectId().toHexString(),
      content: request.content,
      systemId: request.systemId,
    };

    return Selector.create(selectorProperties);
  };
}
