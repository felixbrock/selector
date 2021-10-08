// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  ReadSelectors,
  ReadSelectorsAuthDto,
  ReadSelectorsRequestDto,
  ReadSelectorsResponseDto,
} from '../../../domain/selector/read-selectors';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadSelectorsController extends BaseController {
  #readSelectors: ReadSelectors;

  #getAccounts: GetAccounts;

  public constructor(readSelectors: ReadSelectors, getAccounts: GetAccounts) {
    super();
    this.#readSelectors = readSelectors;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<ReadSelectorsRequestDto> => {
    const {
      systemId,
      content,
      organizationId,
      alertCreatedOnStart,
      alertCreatedOnEnd,
      modifiedOnStart,
      modifiedOnEnd,
    } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      systemId,
      content,
      organizationId,
      alertCreatedOnStart,
      alertCreatedOnEnd,
      modifiedOnStart,
      modifiedOnEnd,
    ]);
    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in URL encoded string format'
      );

    try {
      return Result.ok<ReadSelectorsRequestDto>({
        content: typeof content === 'string' ? content : undefined,
        systemId: typeof systemId === 'string' ? systemId : undefined,
        alert: {
          createdOnStart:
            typeof alertCreatedOnStart === 'string'
              ? this.#buildDate(alertCreatedOnStart)
              : undefined,
          createdOnEnd:
            typeof alertCreatedOnEnd === 'string'
              ? this.#buildDate(alertCreatedOnEnd)
              : undefined,
        },
        modifiedOnStart:
          typeof modifiedOnStart === 'string'
            ? this.#buildDate(modifiedOnStart)
            : undefined,
        modifiedOnEnd:
          typeof modifiedOnEnd === 'string'
            ? this.#buildDate(modifiedOnEnd)
            : undefined,
      });
    } catch (error: any) {
      return Result.fail<ReadSelectorsRequestDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  #buildDate = (timestamp: string): number => {
    const date = timestamp.match(/[^T]*/s);
    const time = timestamp.match(/(?<=T)[^Z]*/s);

    if (
      !date ||
      !date[0] ||
      date[0].length !== 8 ||
      !time ||
      !time[0] ||
      time[0].length !== 6
    )
      throw new Error(`${timestamp} not in format YYYYMMDD"T"HHMMSS"Z"`);

    const year = date[0].slice(0, 4);
    const month = date[0].slice(4, 6);
    const day = date[0].slice(6, 8);

    const hour = time[0].slice(0, 2);
    const minute = time[0].slice(2, 4);
    const second = time[0].slice(4, 6);

    return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  };

  #buildAuthDto = (userAccountInfo: UserAccountInfo): ReadSelectorsAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return ReadSelectorsController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadSelectorsController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return ReadSelectorsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: Result<ReadSelectorsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadSelectorsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return ReadSelectorsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const authDto: ReadSelectorsAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadSelectorsResponseDto =
        await this.#readSelectors.execute(buildDtoResult.value, authDto);

      if (useCaseResult.error) {
        return ReadSelectorsController.badRequest(res, useCaseResult.error);
      }

      return ReadSelectorsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return ReadSelectorsController.fail(res, error);
    }
  }
}
