import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { Alert } from '../value-types/alert';
import { AlertDto, buildAlertDto } from './alert-dto';
import { SelectorDto } from '../selector/selector-dto';
import { UpdateSelector } from '../selector/update-selector';
import { ISelectorRepository } from '../selector/i-selector-repository';
import { PostWarning } from '../system-api/post-warning';
import WarningDto from '../system-api/warning-dto';

export interface CreateAlertRequestDto {
  selectorId: string;
}

export interface CreateAlertAuthDto {
  organizationId: string;
  jwt: string;
}

export type CreateAlertResponseDto = Result<AlertDto | null>;

export class CreateAlert
  implements
    IUseCase<CreateAlertRequestDto, CreateAlertResponseDto, CreateAlertAuthDto>
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
    request: CreateAlertRequestDto,
    auth: CreateAlertAuthDto
  ): Promise<CreateAlertResponseDto> {
    const alert: Result<Alert | null> = this.#createAlert();
    if (!alert.value) return alert;

    try {
      const selectorDto: SelectorDto | null =
        await this.#selectorRepository.findOne(request.selectorId);
      if (!selectorDto)
        throw new Error(
          `Selector with id ${request.selectorId} does not exist`
        );

      if (selectorDto.organizationId !== auth.organizationId)
        throw new Error(`Not authorized to perform action`);

      const alertDto = buildAlertDto(alert.value);

      const updateSelectorResult: Result<SelectorDto | null> =
        await this.#updateSelector.execute(
          {
            id: request.selectorId,
            alert: alertDto,
          },
          { organizationId: auth.organizationId }
        );

      if (updateSelectorResult.error)
        throw new Error(updateSelectorResult.error);
      if (!updateSelectorResult.value)
        throw new Error(`Couldn't update selector ${request.selectorId}`);

      const postWarningResult: Result<WarningDto | null> =
        await this.#postWarning.execute(
          {
            systemId: selectorDto.systemId,
            selectorId: selectorDto.id,
          },
          { jwt: auth.jwt }
        );

      if (postWarningResult.error) throw new Error(postWarningResult.error);
      if (!postWarningResult.value)
        throw new Error(
          `Couldn't create warning for system ${selectorDto.systemId}`
        );

      return Result.ok<AlertDto>(alertDto);
    } catch (error: any) {
      return Result.fail<AlertDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #createAlert = (): Result<Alert | null> => Alert.create({});
}
