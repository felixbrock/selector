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
    const {
      systemId,
      content,
      alertCreatedOnStart,
      alertCreatedOnEnd,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      systemId,
      content,
      alertCreatedOnStart,
      alertCreatedOnEnd,
      modifiedOnStart,
      modifiedOnEnd,
    ]);
    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in string format'
      );

    const startTime = '00:00:00';
    const endTime = '23:59:59';

    if (
      typeof timezoneOffset === 'string' &&
      timezoneOffset.indexOf('-') === -1 &&
      timezoneOffset.indexOf('+') === -1
    )
      throw new Error(
        `TimezoneOffset is not in correct format. '-' or '+' missing. Make sure to use URL encoding ('-'; '%2B' for '+' character)`
      );

    try {
      return Result.ok<ReadSelectorsRequestDto>({
        content: typeof content === 'string' ? content : undefined,
        systemId: typeof systemId === 'string' ? systemId : undefined,
        alert: {
          createdOnStart:
            typeof alertCreatedOnStart === 'string'
              ? Date.parse(
                  `${alertCreatedOnStart} ${startTime} ${timezoneOffset || ''}`
                )
              : undefined,
          createdOnEnd:
            typeof alertCreatedOnEnd === 'string'
              ? Date.parse(
                  `${alertCreatedOnEnd} ${endTime} ${timezoneOffset || ''}`
                )
              : undefined,
        },
        modifiedOnStart:
          typeof modifiedOnStart === 'string'
            ? Date.parse(
                `${modifiedOnStart} ${startTime} ${timezoneOffset || ''}`
              )
            : undefined,
        modifiedOnEnd:
          typeof modifiedOnEnd === 'string'
            ? Date.parse(`${modifiedOnEnd} ${endTime} ${timezoneOffset || ''}`)
            : undefined,
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
