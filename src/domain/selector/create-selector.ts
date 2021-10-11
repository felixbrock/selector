// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { Selector, SelectorProperties } from '../entities/selector';
import { SelectorDto, buildSelectorDto } from './selector-dto';
import { ISelectorRepository } from './i-selector-repository';
import { ReadSelectors, ReadSelectorsResponseDto } from './read-selectors';

export interface CreateSelectorRequestDto {
  content: string;
  systemId: string;
}

export interface CreateSelectorAuthDto {
  organizationId: string;
}

export type CreateSelectorResponseDto = Result<SelectorDto | null>;

export class CreateSelector
  implements
    IUseCase<
      CreateSelectorRequestDto,
      CreateSelectorResponseDto,
      CreateSelectorAuthDto
    >
{
  #selectorRepository: ISelectorRepository;

  #readSelectors: ReadSelectors;

  public constructor(
    selectorRepository: ISelectorRepository,
    readSelectors: ReadSelectors
  ) {
    this.#readSelectors = readSelectors;
    this.#selectorRepository = selectorRepository;
  }

  public async execute(
    request: CreateSelectorRequestDto,
    auth: CreateSelectorAuthDto
  ): Promise<CreateSelectorResponseDto> {
    const selector: Result<Selector | null> = this.#createSelector(
      request,
      auth.organizationId
    );
    if (!selector.value) return selector;

    try {
      const readSelectorResult: ReadSelectorsResponseDto =
        await this.#readSelectors.execute(
          {
            content: selector.value.content,
          },
          { organizationId: auth.organizationId }
        );

      if (!readSelectorResult.success)
        throw new Error(readSelectorResult.error);
      if (!readSelectorResult.value)
        throw new Error('Reading selectors failed');
      if (readSelectorResult.value.length)
        throw new Error(
          `Selector ${readSelectorResult.value[0].content} is already registered under ${readSelectorResult.value[0].id}`
        );

      await this.#selectorRepository.insertOne(selector.value);

      return Result.ok<SelectorDto>(buildSelectorDto(selector.value));
    } catch (error: any) {
      return Result.fail<SelectorDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #createSelector = (
    request: CreateSelectorRequestDto,
    organizationId: string
  ): Result<Selector | null> => {
    const selectorProperties: SelectorProperties = {
      id: new ObjectId().toHexString(),
      content: request.content,
      systemId: request.systemId,
      organizationId,
    };

    return Selector.create(selectorProperties);
  };
}
