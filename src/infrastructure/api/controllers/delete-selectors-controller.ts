// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  DeleteSelectors,
  DeleteSelectorsRequestDto,
  DeleteSelectorsResponseDto,
} from '../../../domain/selector/delete-selectors';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class DeleteSelectorsController extends BaseController {
  #deleteSelectors: DeleteSelectors;

  public constructor(deleteSelectors: DeleteSelectors) {
    super();
    this.#deleteSelectors = deleteSelectors;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<DeleteSelectorsRequestDto> => {
    const { systemId } = httpRequest.query;
    if (typeof systemId === 'string')
      return Result.ok<DeleteSelectorsRequestDto>({
        systemId,
      });
    return Result.fail<DeleteSelectorsRequestDto>(
      'request query parameter systemId is supposed to be in string format'
    );
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<DeleteSelectorsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return DeleteSelectorsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return DeleteSelectorsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const useCaseResult: DeleteSelectorsResponseDto =
        await this.#deleteSelectors.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return DeleteSelectorsController.badRequest(res, useCaseResult.error);
      }

      return DeleteSelectorsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return DeleteSelectorsController.fail(res, error);
    }
  }
}
