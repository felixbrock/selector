// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  DeleteSelectors,
  DeleteSelectorsAuthDto,
  DeleteSelectorsRequestDto,
  DeleteSelectorsResponseDto,
} from '../../../domain/selector/delete-selectors';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class DeleteSelectorsController extends BaseController {
  #deleteSelectors: DeleteSelectors;

  #getAccounts: GetAccounts;

  public constructor(
    deleteSelectors: DeleteSelectors,
    getAccounts: GetAccounts
  ) {
    super();
    this.#deleteSelectors = deleteSelectors;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<DeleteSelectorsRequestDto> => {
    const { systemId } = httpRequest.query;
    if (typeof systemId === 'string')
      return Result.ok({
        systemId,
      });
    return Result.fail(
      'request query parameter systemId is supposed to be in string format'
    );
  };

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo,
    jwt: string
  ): DeleteSelectorsAuthDto => ({
    organizationId: userAccountInfo.organizationId,
    jwt,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return DeleteSelectorsController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];     

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteSelectorsController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteSelectorsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: Result<DeleteSelectorsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return DeleteSelectorsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return DeleteSelectorsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const authDto: DeleteSelectorsAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value,
        jwt
      );

      const useCaseResult: DeleteSelectorsResponseDto =
        await this.#deleteSelectors.execute(buildDtoResult.value, authDto);

      if (useCaseResult.error) {
        return DeleteSelectorsController.badRequest(res, useCaseResult.error);
      }

      return DeleteSelectorsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return DeleteSelectorsController.fail(res, error);
      if (error instanceof Error)
        return DeleteSelectorsController.fail(res, error);
      return DeleteSelectorsController.fail(res, 'Unknown error occured');
    }
  }
}
