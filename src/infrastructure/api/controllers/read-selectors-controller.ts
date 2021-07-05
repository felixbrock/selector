// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadSelectors,
  ReadSelectorsRequestDto,
  ReadSelectorsResponseDto,
} from '../../../domain/selector/read-selectors';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadSelectorsController extends BaseController {
  #readSelectors: ReadSelectors;

  public constructor(readSelectors: ReadSelectors) {
    super();
    this.#readSelectors = readSelectors;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<ReadSelectorsRequestDto> => {
    const { systemId, content, alertCreatedOn, modifiedOn } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      systemId,
      content,
      alertCreatedOn,
      modifiedOn,
    ]);
    if (!requestValid)
      return Result.fail<ReadSelectorsRequestDto>(
        'Request query parameter are supposed to be in string format'
      );

    try {
      return Result.ok<ReadSelectorsRequestDto>({
        content:
        typeof content === 'string' ? content : undefined,
        systemId:
          typeof systemId === 'string' ? systemId : undefined,
        alert: {
          createdOn:
            typeof alertCreatedOn === 'string' ? parseInt(alertCreatedOn, 10) : undefined,
        },
        modifiedOn:
          typeof modifiedOn === 'string' ? parseInt(modifiedOn, 10) : undefined,
      });
      
    } catch (error) {
      return Result.fail<ReadSelectorsRequestDto>(error.message);
    }

    
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<ReadSelectorsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadSelectorsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return ReadSelectorsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const useCaseResult: ReadSelectorsResponseDto =
        await this.#readSelectors.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return ReadSelectorsController.badRequest(res, useCaseResult.error);
      }

      return ReadSelectorsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error) {
      return ReadSelectorsController.fail(res, error);
    }
  }
}
