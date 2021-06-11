// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadSelector,
  ReadSelectorRequestDto,
  ReadSelectorResponseDto,
} from '../../../domain/use-cases/read-selector';
import { BaseController, CodeHttp } from '../../shared';

export default class ReadSelectorController extends BaseController {
  #readSelector: ReadSelector;

  public constructor(readSelector: ReadSelector) {
    super();
    this.#readSelector = readSelector;
  }

  #buildRequestDto = (httpRequest: Request): ReadSelectorRequestDto => ({
    id: httpRequest.params.selectorId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: ReadSelectorRequestDto = this.#buildRequestDto(req);
      const useCaseResult: ReadSelectorResponseDto =
        await this.#readSelector.execute(requestDto);

      if (useCaseResult.error) {
        return ReadSelectorController.badRequest(res, useCaseResult.error);
      }

      return ReadSelectorController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return ReadSelectorController.fail(res, error);
    }
  }
}
