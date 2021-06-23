// TODO Violation of Dependency Rule
import { v4 as uuidv4 } from 'uuid';
import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import { Id } from '../value-types';
import { Selector, SelectorProperties } from '../entities';
import SelectorDto from './selector-dto';
import {ISelectorRepository} from './i-selector-repository';

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
      const readSelectorResult: SelectorDto[]  =
        await this.#selectorRepository.findBy({content: selector.value.content});
      if (readSelectorResult.length)
        throw new Error(
          `Selector ${readSelectorResult[0].content} is already registered under ${readSelectorResult[0].id}`
        );

      await this.#selectorRepository.save(selector.value);

      return Result.ok<SelectorDto>(this.#buildSelectorDto(selector.value));
    } catch (error) {
      return Result.fail<SelectorDto>(error.message);
    }
  }

  #buildSelectorDto = (selector: Selector): SelectorDto => ({
    id: selector.id,
    content: selector.content,
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts
  });

  #createSelector = (request: CreateSelectorRequestDto): Result<Selector | null> => {
    const selectorProperties: SelectorProperties = {
      id: Id.next(uuidv4).id,
      content: request.content,
      systemId: request.systemId,
    };

    return Selector.create(selectorProperties);
  };
}
