import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import {ISelectorRepository} from './i-selector-repository';
import { Selector } from '../entities/selector';
import { DeleteTargets } from '../subscription-api/delete-targets';

export interface DeleteSelectorRequestDto {
  id: string;
}

export type DeleteSelectorResponseDto = Result<null>;

export class DeleteSelector
  implements IUseCase<DeleteSelectorRequestDto, DeleteSelectorResponseDto>
{
  #selectorRepository: ISelectorRepository;

  #deleteTargets: DeleteTargets;

  public constructor(
    selectorRepository: ISelectorRepository,
    deleteTargets: DeleteTargets
  ) {
    this.#selectorRepository = selectorRepository;
    this.#deleteTargets = deleteTargets;
  }

  public async execute(
    request: DeleteSelectorRequestDto
  ): Promise<DeleteSelectorResponseDto> {
    try {
      const selector: Selector | null = await this.#selectorRepository.findOne(
        request.id
      );
      if (!selector)
        throw new Error(`Selector with id ${request.id} does not exist`);

      const deleteTargetsResult: Result<null> =
        await this.#deleteTargets.execute({ selectorId: request.id });

      if (deleteTargetsResult.error) throw new Error(deleteTargetsResult.error);

      const deleteSelectorResult: Result<null> =
        await this.#selectorRepository.delete(request.id);

      if(deleteSelectorResult.error) throw new Error(deleteSelectorResult.error);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
