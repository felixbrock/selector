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

export type CreateSelectorResponseDto = Result<SelectorDto>;

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
    try {
      const selector: Selector = this.#createSelector(
        request,
        auth.organizationId
      );

      const readSelectorResult: ReadSelectorsResponseDto =
        await this.#readSelectors.execute(
          {
            content: selector.content,
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

      await this.#selectorRepository.insertOne(selector);

      return Result.ok(buildSelectorDto(selector));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #createSelector = (
    request: CreateSelectorRequestDto,
    organizationId: string
  ): Selector => {
    const selectorProperties: SelectorProperties = {
      id: new ObjectId().toHexString(),
      content: request.content,
      systemId: request.systemId,
      organizationId,
    };

    return Selector.create(selectorProperties);
  };
}
