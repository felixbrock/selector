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
  ): Promise<string>;
}

export type DeleteSubscriptionsResponseDto = Result<string>;

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
      const selectorResult: string =
        await this.#automationApiRepository.deleteSubscriptions(
          new URLSearchParams({ selectorId: request.selectorId }),
          auth.jwt
        );
      if (!selectorResult)
        throw new Error(
          `Subscriptions for selector ${request.selectorId} was not deleted. Unclear if subscription exists`
        );

      return Result.ok(selectorResult);
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
