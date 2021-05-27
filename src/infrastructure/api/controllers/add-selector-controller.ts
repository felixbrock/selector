// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { AddSelector, AddSelectorRequestDto, AddSelectorResponseDto } from '../../../domain/use-cases/add-selector';
import { BaseController, CodeHttp } from '../../shared';

export default class AddSelectorController extends BaseController {
  #addSelector: AddSelector;

  public constructor(addSelector: AddSelector) {
    super();
    this.#addSelector = addSelector;
  }

  public static buildRequestDto(httpRequest: Request): AddSelectorRequestDto {
    return {
      systemId: httpRequest.body.systemId,
      content: httpRequest.body.content,
    };
  }


  // TODO - replace all try catch with then catch 
  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const dto : AddSelectorRequestDto = AddSelectorController.buildRequestDto(req);
      const useCaseResult : AddSelectorResponseDto = await this.#addSelector.execute(dto);

      if (useCaseResult.error) {
        return AddSelectorController.badRequest(res, useCaseResult.error);
      }

      return AddSelectorController.ok(res, useCaseResult.value, CodeHttp.CREATED);
    } catch (error) {
      return AddSelectorController.fail(res, error);
    }
  }
}
