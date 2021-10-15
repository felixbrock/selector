// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  CreateSelector,
  CreateSelectorAuthDto,
  CreateSelectorRequestDto,
  CreateSelectorResponseDto,
} from '../../../domain/selector/create-selector';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateSelectorController extends BaseController {
  #createSelector: CreateSelector;

  #getAccounts: GetAccounts;

  public constructor(createSelector: CreateSelector, getAccounts: GetAccounts) {
    super();
    this.#createSelector = createSelector;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): CreateSelectorRequestDto => ({
    systemId: httpRequest.body.systemId,
    content: httpRequest.body.content,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): CreateSelectorAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return CreateSelectorController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];     

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateSelectorController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateSelectorController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: CreateSelectorRequestDto = this.#buildRequestDto(req);
      const authDto: CreateSelectorAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateSelectorResponseDto =
        await this.#createSelector.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return CreateSelectorController.badRequest(res, useCaseResult.error);
      }

      return CreateSelectorController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return CreateSelectorController.fail(res, error);
      if (error instanceof Error)
        return CreateSelectorController.fail(res, error);
      return CreateSelectorController.fail(res, 'Unknown error occured');
    }
  }
}
