import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import { Alert } from '../value-types';
import AlertDto from './alert-dto';
import SelectorDto from '../selector/selector-dto';
import { UpdateSelector } from '../selector/update-selector';
import ISelectorRepository from '../selector/i-selector-repository';
import { PostWarning } from '../system-api/post-warning';
import WarningDto from '../system-api/warning-dto';

export interface CreateAlertRequestDto {
  selectorId: string;
}

export type CreateAlertResponseDto = Result<AlertDto | null>;

export class CreateAlert
  implements IUseCase<CreateAlertRequestDto, CreateAlertResponseDto>
{
  #selectorRepository: ISelectorRepository;

  #updateSelector: UpdateSelector;

  #postWarning: PostWarning;

  public constructor(
    selectorRepository: ISelectorRepository,
    updateSelector: UpdateSelector,
    postWarning: PostWarning
  ) {
    this.#selectorRepository = selectorRepository;
    this.#updateSelector = updateSelector;
    this.#postWarning = postWarning;
  }

  public async execute(
    request: CreateAlertRequestDto
  ): Promise<CreateAlertResponseDto> {
    const alert: Result<Alert | null> = this.#createAlert();
    if (!alert.value) return alert;

    try {
      const selectorDto: SelectorDto | null = await this.#selectorRepository.findById(
        request.selectorId
      );
      if (!selectorDto)
        return Result.fail<null>(`Selector with id ${request.selectorId} does not exist`);

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

        const postWarningResult: Result<WarningDto | null> =
        await this.#postWarning.execute({
          systemId: selectorDto.systemId
        });

      if (postWarningResult.error)
        return Result.fail<null>(postWarningResult.error);
      if (!postWarningResult.value)
        return Result.fail<null>(
          `Couldn't create warning for system ${selectorDto.systemId}`
        );

      return Result.ok<AlertDto>(alertDto);
    } catch (error) {
      return Result.fail<AlertDto>(error.message);
    }
  }

  #buildAlertDto = (alert: Alert): AlertDto => ({
    createdOn: alert.createdOn,
  });

  #createAlert = (): Result<Alert | null> => Alert.create();
}
