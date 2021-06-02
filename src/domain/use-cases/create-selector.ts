import { v4 as uuidv4 } from 'uuid';
import IUseCase from '../shared';
import { Id, Result } from '../entities/value-types';
import { Selector, SelectorProps } from '../entities/reference-types';

export interface CreateSelectorRequestDto {
  content: string;
  systemId: string;
}

export type CreateSelectorResponseDto = Result<CreateSelectorDto | null>;

export interface CreateSelectorDto {
  id: string;
  content: string;
  systemId: string;
  modifiedOn: number;
  createdOn: number;
}

export interface ICreateSelectorRepository {
  findByContent(selector: string): Promise<CreateSelectorDto | null>;
  save(selector: Selector): Promise<void>;
}

export class CreateSelector
  implements IUseCase<CreateSelectorRequestDto, CreateSelectorResponseDto>
{
  #createSelectorRepository: ICreateSelectorRepository;

  public constructor(createSelectorRepository: ICreateSelectorRepository) {
    this.#createSelectorRepository = createSelectorRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: CreateSelectorRequestDto
  ): Promise<CreateSelectorResponseDto> {
    const selector: Result<Selector | null> = this.#createSelector(request);
    if (!selector.value) return selector;

    try {
      const createSelectorDto: CreateSelectorDto | null =
        await this.#createSelectorRepository.findByContent(
          selector.value.content
        );
      if (createSelectorDto) return Result.fail<null>('Selector is already registered');

      await this.#createSelectorRepository.save(selector.value);

      return Result.ok<CreateSelectorDto>(
        this.#buildSelectorDto(selector.value)
      );
    } catch (error) {
      return Result.fail<CreateSelectorDto>(error.message);
    }
  }

  #buildSelectorDto = (selector: Selector): CreateSelectorDto => ({
    id: selector.id,
    content: selector.content,
    systemId: selector.systemId,
    createdOn: selector.createdOn,
    modifiedOn: selector.modifiedOn,
  });

  #createSelector = (
    request: CreateSelectorRequestDto
  ): Result<Selector | null> => {
    const selectorProps: SelectorProps = {
      id: Id.next(uuidv4).id,
      content: request.content,
      systemId: request.systemId,
    };

    return Selector.create(selectorProps);
  };
}
