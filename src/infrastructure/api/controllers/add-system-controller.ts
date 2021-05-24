// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { AddSystem, AddSystemRequestDto, AddSystemResponseDto } from '../../../domain/add-system';
import { BaseController, CodeHttp } from '../../shared';

export default class AddSystemController extends BaseController {
  #addSystem: AddSystem;

  public constructor(addSystem: AddSystem) {
    super();
    this.#addSystem = addSystem;
  }

  private static buildRequestDto(httpRequest: Request): AddSystemRequestDto {
    return {
      name: httpRequest.body.name
    };
  }


  // TODO - replace all try catch with then catch 
  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const dto : AddSystemRequestDto = AddSystemController.buildRequestDto(req);
      const useCaseResult : AddSystemResponseDto = await this.#addSystem.execute(dto);

      if (useCaseResult.error) {
        return AddSystemController.badRequest(res, useCaseResult.error);
      }

      return AddSystemController.ok(res, useCaseResult.value, CodeHttp.CREATED);
    } catch (error) {
      return AddSystemController.fail(res, error);
    }
  }
}
