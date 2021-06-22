import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';

export interface DeleteTargetsRequestDto {
  selectorId: string;
}

export interface ISubscriptionApiRepository {
  deleteTargets(selectorId: string): Promise<Result<null>>;
}

export type DeleteTargetsResponseDto = Result<null>;

export class DeleteTargets
  implements IUseCase<DeleteTargetsRequestDto, DeleteTargetsResponseDto>
{
  #subscriptionApiRepository: ISubscriptionApiRepository;

  public constructor(subscriptionApiRepository: ISubscriptionApiRepository) {
    this.#subscriptionApiRepository = subscriptionApiRepository;
  }

  public async execute(
    request: DeleteTargetsRequestDto
  ): Promise<DeleteTargetsResponseDto> {
    try {
      const selectorResult: Result<null> = await this.#subscriptionApiRepository.deleteTargets(
        request.selectorId
      );
      if (!selectorResult)
        throw new Error(`No targets for selector ${request.selectorId} exist`);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
