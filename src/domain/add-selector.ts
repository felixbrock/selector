import { v4 as uuidv4 } from 'uuid';
import IUseCase from './shared';
import { Id, Result } from './entities/value-types';
import { Selector, SelectorProps } from './entities/reference-types';

export interface AddSelectorRequestDto {
  selector: string;
  system: string;
}

export type AddSelectorResponseDto = Result<AddSelectorDto> | Result<null>;

export interface AddSelectorDto {
  id: string;
  selector: string;
  system: string;
  modifiedOn: number;
  createdOn: number;
}

export interface IAddSelectorRepository {
  findBySelector(selector: string): Promise<AddSelectorDto | null>;
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
    const createResult: Result<Selector> = this.#createSelector(request);
    if (!createResult.value) return createResult;

    try {
      const selector: AddSelectorDto | null =
        await this.#addSelectorRepository.findBySelector(
          createResult.value.selector
        );
      if (selector) return Result.fail<null>('Selector is already registered');

      await this.#addSelectorRepository.save(createResult.value);

      return Result.ok<AddSelectorDto>(
        this.#buildSelectorDto(createResult.value)
      );
    } catch (error) {
      return Result.fail<AddSelectorDto>(error.message);
    }
  }

  #buildSelectorDto = (selector: Selector): AddSelectorDto => ({
    id: selector.id,
    selector: selector.selector,
    system: selector.system,
    createdOn: selector.createdOn,
    modifiedOn: selector.modifiedOn,
  });

  #createSelector = (request: AddSelectorRequestDto): Result<Selector> => {
    const selectorProps: SelectorProps = {
      id: Id.next(uuidv4).id,
      selector: request.selector,
      system: request.system,
    };

    return Selector.create(selectorProps);
  };
}
