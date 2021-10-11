import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { ISelectorRepository } from './i-selector-repository';
import { DeleteSubscriptions } from '../automation-api/delete-subscriptions';
import { ReadSelector } from './read-selector';

export interface DeleteSelectorRequestDto {
  id: string;
}

export interface DeleteSelectorAuthDto {
  organizationId: string;
  jwt: string;
}

export type DeleteSelectorResponseDto = Result<null>;

export class DeleteSelector
  implements
    IUseCase<
      DeleteSelectorRequestDto,
      DeleteSelectorResponseDto,
      DeleteSelectorAuthDto
    >
{
  #selectorRepository: ISelectorRepository;

  #deleteSubscriptions: DeleteSubscriptions;

  #readSelector: ReadSelector;

  public constructor(
    selectorRepository: ISelectorRepository,
    deleteSubscriptions: DeleteSubscriptions,
    readSelector: ReadSelector
  ) {
    this.#selectorRepository = selectorRepository;
    this.#deleteSubscriptions = deleteSubscriptions;
    this.#readSelector = readSelector;
  }

  public async execute(
    request: DeleteSelectorRequestDto,
    auth: DeleteSelectorAuthDto
  ): Promise<DeleteSelectorResponseDto> {
    try {
      const readSelectorResult = await this.#readSelector.execute(
        { id: request.id },
        { organizationId: auth.organizationId }
      );

      if (!readSelectorResult.success)
        throw new Error(readSelectorResult.error);

      if (!readSelectorResult.value)
        throw new Error(`Selector with id ${request.id} does not exist`);

      if (readSelectorResult.value.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const deleteSubscriptionsResult: Result<null> =
        await this.#deleteSubscriptions.execute(
          { selectorId: request.id },
          { jwt: auth.jwt }
        );

      if (deleteSubscriptionsResult.error)
        throw new Error(deleteSubscriptionsResult.error);

      const deleteSelectorResult: Result<null> =
        await this.#selectorRepository.deleteOne(request.id);

      if (deleteSelectorResult.error)
        throw new Error(deleteSelectorResult.error);

      return Result.ok<null>();
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
