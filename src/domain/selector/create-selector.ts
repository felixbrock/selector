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

  public constructor(selectorRepository: ISelectorRepository) {
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
