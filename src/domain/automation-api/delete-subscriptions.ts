import { URLSearchParams } from 'url';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';

export interface DeleteSubscriptionsRequestDto {
  selectorId: string;
}

export interface IAutomationApiRepository {
  deleteSubscriptions(params: URLSearchParams): Promise<Result<null>>;
}

export type DeleteSubscriptionsResponseDto = Result<null>;

export class DeleteSubscriptions
  implements IUseCase<DeleteSubscriptionsRequestDto, DeleteSubscriptionsResponseDto>
{
  #automationApiRepository: IAutomationApiRepository;

  public constructor(automationApiRepository: IAutomationApiRepository) {
    this.#automationApiRepository = automationApiRepository;
  }

  public async execute(
    request: DeleteSubscriptionsRequestDto
  ): Promise<DeleteSubscriptionsResponseDto> {
    try {
      const selectorResult: Result<null> = await this.#automationApiRepository.deleteSubscriptions(
        new URLSearchParams({selectorId: request.selectorId})
      );
      if (!selectorResult)
        throw new Error(`No subscriptions for selector ${request.selectorId} exist`);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
