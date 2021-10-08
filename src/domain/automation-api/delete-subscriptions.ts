import { URLSearchParams } from 'url';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';

export interface DeleteSubscriptionsRequestDto {
  selectorId: string;
}

export interface DeleteSubscriptionsAuthDto {
  jwt: string;
}

export interface IAutomationApiRepository {
  deleteSubscriptions(
    params: URLSearchParams,
    jwt: string
  ): Promise<Result<null>>;
}

export type DeleteSubscriptionsResponseDto = Result<null>;

export class DeleteSubscriptions
  implements
    IUseCase<
      DeleteSubscriptionsRequestDto,
      DeleteSubscriptionsResponseDto,
      DeleteSubscriptionsAuthDto
    >
{
  #automationApiRepository: IAutomationApiRepository;

  public constructor(automationApiRepository: IAutomationApiRepository) {
    this.#automationApiRepository = automationApiRepository;
  }

  public async execute(
    request: DeleteSubscriptionsRequestDto,
    auth: DeleteSubscriptionsAuthDto
  ): Promise<DeleteSubscriptionsResponseDto> {
    try {
      const selectorResult: Result<null> =
        await this.#automationApiRepository.deleteSubscriptions(
          new URLSearchParams({ selectorId: request.selectorId }),
          auth.jwt
        );
      if (!selectorResult)
        throw new Error(
          `No subscriptions for selector ${request.selectorId} exist`
        );

      return Result.ok<null>();
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
