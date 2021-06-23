import IUseCase from '../services/use-case';
import { Selector } from '../entities';
import SelectorDto from './selector-dto';
import ISelectorRepository from './i-selector-repository';
import Result from '../value-types/transient-types';
import { Alert } from '../value-types';
import AlertDto from '../alert/alert-dto';

// TODO - This would be a PATCH use-case since not all fields need to be necessarily updated

export interface UpdateSelectorRequestDto {
  id: string;
  content?: string;
  alert?: AlertDto;
}

export type UpdateSelectorResponseDto = Result<SelectorDto | null>;

export class UpdateSelector
  implements IUseCase<UpdateSelectorRequestDto, UpdateSelectorResponseDto>
{
  #selectorRepository: ISelectorRepository;

  public constructor(selectorRepository: ISelectorRepository) {
    this.#selectorRepository = selectorRepository;
  }

  public async execute(
    request: UpdateSelectorRequestDto
  ): Promise<UpdateSelectorResponseDto> {
    try {
      const selector: Selector | null = await this.#selectorRepository.findOne(
        request.id
      );

      if (!selector)
        throw new Error(
          `Selector with id ${request.id} does not exist`
        );

      const modifiedSelector = await this.#modifySelector(selector, request);

      await this.#selectorRepository.update(modifiedSelector);

      return Result.ok<SelectorDto>(this.#buildSelectorDto(modifiedSelector));
    } catch (error) {
      return Result.fail<SelectorDto>(error.message);
    }
  }

  #buildSelectorDto = (selector: Selector): SelectorDto => ({
    id: selector.id,
    content: selector.content,
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts,
  });

  #modifySelector = async (
    selector: Selector,
    request: UpdateSelectorRequestDto
  ): Promise<Selector> => {
    const selectorToModify = selector;

    if (request.content) {
      const readSelectorResult: SelectorDto | null =
        await this.#selectorRepository.findByContent(request.content);
      if (readSelectorResult)
        throw new Error(
          `Selector ${readSelectorResult.content} is already registered under ${readSelectorResult.id}`
        );

      selectorToModify.content = request.content;
    }

    if (request.alert) {
      const alertResult = Alert.create();
      // TODO No uniform usage of Result.value Result.error and result.success. Fix.
      if (alertResult.error) throw new Error(alertResult.error);
      if (!alertResult.value)
        throw new Error(`Creation of selector alert ${request.alert} failed`);

      selectorToModify.addAlert(alertResult.value);
    }

    selectorToModify.modifiedOn = Date.now();

    return selectorToModify;
  };
}
