// TODO Violation of Dependency Rule
import { v4 as uuidv4 } from 'uuid';
import { IUseCase, Result } from '../shared';
import Id from '../value-types';
import { Selector, SelectorProps } from '../entities';
import { IReadSystemRepository, ReadSystemDto } from './read-system';

export interface CreateSelectorRequestDto {
  content: string;
  systemId: string;
}

export interface CreateSelectorDto {
  id: string;
  content: string;
  systemId: string;
  modifiedOn: number;
  createdOn: number;
}

export type CreateSelectorResponseDto = Result<CreateSelectorDto | null>;

export interface ICreateSelectorRepository {
  findByContent(selector: string): Promise<CreateSelectorDto | null>;
  save(selector: Selector): Promise<void>;
}

export class CreateSelector
  implements IUseCase<CreateSelectorRequestDto, CreateSelectorResponseDto>
{
  #createSelectorRepository: ICreateSelectorRepository;

  #readSystemRepository: IReadSystemRepository;

  public constructor(
    createSelectorRepository: ICreateSelectorRepository,
    readSystemRepository: IReadSystemRepository
  ) {
    this.#createSelectorRepository = createSelectorRepository;
    this.#readSystemRepository = readSystemRepository;
  }

  public async execute(
    request: CreateSelectorRequestDto
  ): Promise<CreateSelectorResponseDto> {
    const selector: Result<Selector | null> = this.#createSelector(request);
    if (!selector.value) return selector;

    try {
      const validatedRequest = await this.validateRequest(selector.value);
      if (validatedRequest.error)
        return Result.fail<CreateSelectorDto>(validatedRequest.error);

      await this.#createSelectorRepository.save(selector.value);

      return Result.ok<CreateSelectorDto>(
        this.#buildSelectorDto(selector.value)
      );
    } catch (error) {
      return Result.fail<CreateSelectorDto>(error.message);
    }
  }

  private async validateRequest(selector: Selector): Promise<Result<null>> {
    const readSelectorResult: CreateSelectorDto | null =
      await this.#createSelectorRepository.findByContent(selector.content);
    if (readSelectorResult)
      return Result.fail<null>(
        `Selector is already registered under ${readSelectorResult.id}`
      );

    const readSystemResult: ReadSystemDto | null =
      await this.#readSystemRepository.findById(selector.systemId);

    if (readSystemResult)
      return Result.fail<null>(`System ${selector.systemId} not found`);

    return Result.ok<null>(null);
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
