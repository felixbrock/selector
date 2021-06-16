// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { CreateSelector, CreateSelectorRequestDto, CreateSelectorResponseDto } from '../../../domain/selector/create-selector';
import { BaseController, CodeHttp } from '../../shared';

export default class CreateSelectorController extends BaseController {
  #createSelector: CreateSelector;

  public constructor(createSelector: CreateSelector) {
    super();
    this.#createSelector = createSelector;
  }

  #buildRequestDto = (httpRequest: Request): CreateSelectorRequestDto => ({
    systemId: httpRequest.body.systemId,
    content: httpRequest.body.content,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: CreateSelectorRequestDto =
        this.#buildRequestDto(req);
      const useCaseResult: CreateSelectorResponseDto =
        await this.#createSelector.execute(requestDto);

      if (useCaseResult.error) {
        return CreateSelectorController.badRequest(res, useCaseResult.error);
      }

      return CreateSelectorController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error) {
      return CreateSelectorController.fail(res, error);
    }
  }
}
