import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import {ISelectorRepository} from './i-selector-repository';
import { Selector } from '../entities/selector';
import { DeleteSubscriptions } from '../automation-api/delete-subscriptions';

export interface DeleteSelectorRequestDto {
  id: string;
}

export type DeleteSelectorResponseDto = Result<null>;

export class DeleteSelector
  implements IUseCase<DeleteSelectorRequestDto, DeleteSelectorResponseDto>
{
  #selectorRepository: ISelectorRepository;

  #deleteSubscriptions: DeleteSubscriptions;

  public constructor(
    selectorRepository: ISelectorRepository,
    deleteSubscriptions: DeleteSubscriptions
  ) {
    this.#selectorRepository = selectorRepository;
    this.#deleteSubscriptions = deleteSubscriptions;
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

      const deleteSubscriptionsResult: Result<null> =
        await this.#deleteSubscriptions.execute({ selectorId: request.id });

      if (deleteSubscriptionsResult.error) throw new Error(deleteSubscriptionsResult.error);

      const deleteSelectorResult: Result<null> =
        await this.#selectorRepository.delete(request.id);

      if(deleteSelectorResult.error) throw new Error(deleteSelectorResult.error);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
