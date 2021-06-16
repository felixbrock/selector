import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import { Alert } from '../value-types';
import AlertDto from './alert-dto';
import SelectorDto from '../selector/selector-dto';
import { UpdateSelector } from '../selector/update-selector';
import ISelectorRepository from '../selector/i-selector-repository';

export interface CreateAlertRequestDto {
  selectorId: string;
}

export type CreateAlertResponseDto = Result<AlertDto | null>;

export class CreateAlert
  implements IUseCase<CreateAlertRequestDto, CreateAlertResponseDto>
{
  #selectorRepository: ISelectorRepository;

  #updateSelector: UpdateSelector;

  public constructor(
    selectorRepository: ISelectorRepository,
    updateSelector: UpdateSelector
  ) {
    this.#selectorRepository = selectorRepository;
    this.#updateSelector = updateSelector;
  }

  public async execute(
    request: CreateAlertRequestDto
  ): Promise<CreateAlertResponseDto> {
    const alert: Result<Alert | null> = this.#createAlert();
    if (!alert.value) return alert;

    try {
      const validatedRequest = await this.validateRequest(request.selectorId);
      if (validatedRequest.error)
        return Result.fail<AlertDto>(validatedRequest.error);

      const alertDto = this.#buildAlertDto(alert.value);

      const updateSelectorResult: Result<SelectorDto | null> =
        await this.#updateSelector.execute({
          id: request.selectorId,
          alert: alertDto,
        });

      if (updateSelectorResult.error)
        return Result.fail<null>(updateSelectorResult.error);
      if (!updateSelectorResult.value)
        return Result.fail<null>(
          `Couldn't update selector ${request.selectorId}`
        );

      return Result.ok<AlertDto>(alertDto);
    } catch (error) {
      return Result.fail<AlertDto>(error.message);
    }
  }

  private async validateRequest(selectorId: string): Promise<Result<null>> {
    const selector: SelectorDto | null = await this.#selectorRepository.findById(
      selectorId
    );
    if (!selector)
      return Result.fail<null>(`Selector with id ${selectorId} does not exist`);

    return Result.ok<null>(null);
  }

  #buildAlertDto = (alert: Alert): AlertDto => ({
    createdOn: alert.createdOn,
  });

  #createAlert = (): Result<Alert | null> => Alert.create();
}
