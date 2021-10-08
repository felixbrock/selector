// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  ReadSelector,
  ReadSelectorAuthDto,
  ReadSelectorRequestDto,
  ReadSelectorResponseDto,
} from '../../../domain/selector/read-selector';
import Result from '../../../domain/value-types/transient-types/result';

import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadSelectorController extends BaseController {
  #readSelector: ReadSelector;

  #getAccounts: GetAccounts;

  public constructor(readSelector: ReadSelector, getAccounts: GetAccounts) {
    super();
    this.#readSelector = readSelector;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): ReadSelectorRequestDto => ({
    id: httpRequest.params.selectorId,
  });

  #buildAuthDto = (userAccountInfo: UserAccountInfo): ReadSelectorAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return ReadSelectorController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadSelectorController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return ReadSelectorController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: ReadSelectorRequestDto = this.#buildRequestDto(req);
      const authDto: ReadSelectorAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadSelectorResponseDto =
        await this.#readSelector.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return ReadSelectorController.badRequest(res, useCaseResult.error);
      }

      return ReadSelectorController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return ReadSelectorController.fail(res, error);
    }
  }
}
