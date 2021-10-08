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

  #buildRequestDto = (httpRequest: Request): Result<CreateAlertRequestDto> => {
    const { selectorId } = httpRequest.params;

    if (!selectorId)
      return Result.fail<CreateAlertRequestDto>(
        'Cannot find request parameter selectorId'
      );

    return Result.ok<CreateAlertRequestDto>({
      selectorId,
    });
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
      const token = req.headers.authorization;

      if (!token)
        return CreateAlertController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateAlertController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateAlertController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: Result<CreateAlertRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return CreateAlertController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return CreateAlertController.badRequest(
          res,
          'Invalid request paramerters'
        );

      const authDto: CreateAlertAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value,
        token
      );

      const useCaseResult: CreateAlertResponseDto =
        await this.#createAlert.execute(buildDtoResult.value, authDto);

      if (useCaseResult.error) {
        return CreateAlertController.badRequest(res, useCaseResult.error);
      }

      return CreateAlertController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: any) {
      return CreateAlertController.fail(res, error);
    }
  }
}
