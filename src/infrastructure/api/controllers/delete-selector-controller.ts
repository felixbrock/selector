// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  DeleteSelector,
  DeleteSelectorAuthDto,
  DeleteSelectorRequestDto,
  DeleteSelectorResponseDto,
} from '../../../domain/selector/delete-selector';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class DeleteSelectorController extends BaseController {
  #deleteSelector: DeleteSelector;

  #getAccounts: GetAccounts;

  public constructor(deleteSelector: DeleteSelector, getAccounts: GetAccounts) {
    super();
    this.#deleteSelector = deleteSelector;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): DeleteSelectorRequestDto => ({
    id: httpRequest.params.selectorId,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo,
    jwt: string
  ): DeleteSelectorAuthDto => ({
    organizationId: userAccountInfo.organizationId,
    jwt,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return DeleteSelectorController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteSelectorController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteSelectorController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: DeleteSelectorRequestDto = this.#buildRequestDto(req);
      const authDto: DeleteSelectorAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value,
        token
      );

      const useCaseResult: DeleteSelectorResponseDto =
        await this.#deleteSelector.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return DeleteSelectorController.badRequest(res, useCaseResult.error);
      }

      return DeleteSelectorController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return DeleteSelectorController.fail(res, error);
    }
  }
}
