// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  CreateAlert,
  CreateAlertAuthDto,
  CreateAlertRequestDto,
  CreateAlertResponseDto,
} from '../../../domain/alert/create-alert';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateAlertController extends BaseController {
  #createAlert: CreateAlert;

  #getAccounts: GetAccounts;

  public constructor(createAlert: CreateAlert, getAccounts: GetAccounts) {
    super();
    this.#createAlert = createAlert;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): CreateAlertRequestDto => {
    const { selectorId } = httpRequest.params;

    if (!selectorId)
      throw new Error('Cannot find request parameter selectorId');

    return {
      selectorId,
    };
  };

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo,
    jwt: string
  ): CreateAlertAuthDto => ({
    organizationId: userAccountInfo.organizationId,
    jwt,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return CreateAlertController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateAlertController.getUserAccountInfo(jwt, this.#getAccounts);

      if (!getUserAccountInfoResult.success)
        return CreateAlertController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: CreateAlertRequestDto = this.#buildRequestDto(req);

      const authDto: CreateAlertAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value,
        jwt
      );

      const useCaseResult: CreateAlertResponseDto =
        await this.#createAlert.execute(buildDtoResult, authDto);

      if (useCaseResult.error) {
        return CreateAlertController.badRequest(res, useCaseResult.error);
      }

      return CreateAlertController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return CreateAlertController.fail(res, error);
      if (error instanceof Error) return CreateAlertController.fail(res, error);
      return CreateAlertController.fail(res, 'Unknown error occured');
    }
  }
}
