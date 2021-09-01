// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  CreateAlert,
  CreateAlertRequestDto,
  CreateAlertResponseDto,
} from '../../../domain/alert/create-alert';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class CreateAlertController extends BaseController {
  #createAlert: CreateAlert;

  public constructor(createAlert: CreateAlert) {
    super();
    this.#createAlert = createAlert;
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

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<CreateAlertRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return CreateAlertController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return CreateAlertController.badRequest(
          res,
          'Invalid request paramerters'
        );

      const useCaseResult: CreateAlertResponseDto =
        await this.#createAlert.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return CreateAlertController.badRequest(res, useCaseResult.error);
      }

      return CreateAlertController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error) {
      return CreateAlertController.fail(res, error);
    }
  }
}
