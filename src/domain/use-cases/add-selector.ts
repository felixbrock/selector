import { v4 as uuidv4 } from 'uuid';
import IUseCase from '../shared';
import { Id, Result } from '../entities/value-types';
import { Selector, SelectorProps } from '../entities/reference-types';

export interface AddSelectorRequestDto {
  content: string;
  systemId: string;
}

export type AddSelectorResponseDto = Result<AddSelectorDto | null>;

export interface AddSelectorDto {
  id: string;
  content: string;
  systemId: string;
  modifiedOn: number;
  createdOn: number;
}

export interface IAddSelectorRepository {
  findByContent(selector: string): Promise<AddSelectorDto | null>;
  save(selector: Selector): Promise<void>;
}

export class AddSelector
  implements IUseCase<AddSelectorRequestDto, AddSelectorResponseDto>
{
  #addSelectorRepository: IAddSelectorRepository;

  public constructor(addSelectorRepository: IAddSelectorRepository) {
    this.#addSelectorRepository = addSelectorRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: AddSelectorRequestDto
  ): Promise<AddSelectorResponseDto> {
    const selector: Result<Selector | null> = this.#createSelector(request);
    if (!selector.value) return selector;

    try {
      const addSelectorDto: AddSelectorDto | null =
        await this.#addSelectorRepository.findByContent(
          selector.value.content
        );
      if (addSelectorDto) return Result.fail<null>('Selector is already registered');

      await this.#addSelectorRepository.save(selector.value);

      return Result.ok<AddSelectorDto>(
        this.#buildSelectorDto(selector.value)
      );
    } catch (error) {
      return Result.fail<AddSelectorDto>(error.message);
    }
  }

  #buildSelectorDto = (selector: Selector): AddSelectorDto => ({
    id: selector.id,
    content: selector.content,
    systemId: selector.systemId,
    createdOn: selector.createdOn,
    modifiedOn: selector.modifiedOn,
  });

  #createSelector = (
    request: AddSelectorRequestDto
  ): Result<Selector | null> => {
    const selectorProps: SelectorProps = {
      id: Id.next(uuidv4).id,
      content: request.content,
      systemId: request.systemId,
    };

    return Selector.create(selectorProps);
  };
}
