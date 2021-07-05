// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  DeleteSelector,
  DeleteSelectorRequestDto,
  DeleteSelectorResponseDto,
} from '../../../domain/selector/delete-selector';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class DeleteSelectorController extends BaseController {
  #deleteSelector: DeleteSelector;

  public constructor(deleteSelector: DeleteSelector) {
    super();
    this.#deleteSelector = deleteSelector;
  }

  #buildRequestDto = (httpRequest: Request): DeleteSelectorRequestDto => ({
    id: httpRequest.params.selectorId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: DeleteSelectorRequestDto =
        this.#buildRequestDto(req);

      const useCaseResult: DeleteSelectorResponseDto =
        await this.#deleteSelector.execute(requestDto);

      if (useCaseResult.error) {
        return DeleteSelectorController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return DeleteSelectorController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return DeleteSelectorController.fail(res, error);
    }
  }
}
