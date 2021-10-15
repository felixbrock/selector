import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { Alert } from '../value-types/alert';
import { AlertDto, buildAlertDto } from './alert-dto';
import { SelectorDto } from '../selector/selector-dto';
import { UpdateSelector } from '../selector/update-selector';
import { PostWarning } from '../system-api/post-warning';
import WarningDto from '../system-api/warning-dto';
import { ReadSelector } from '../selector/read-selector';

export interface CreateAlertRequestDto {
  selectorId: string;
}

export interface CreateAlertAuthDto {
  organizationId: string;
  jwt: string;
}

export type CreateAlertResponseDto = Result<AlertDto>;

export class CreateAlert
  implements
    IUseCase<CreateAlertRequestDto, CreateAlertResponseDto, CreateAlertAuthDto>
{
  #updateSelector: UpdateSelector;

  #postWarning: PostWarning;

  #readSelector: ReadSelector;

  public constructor(
    updateSelector: UpdateSelector,
    readSelector: ReadSelector,
    postWarning: PostWarning
  ) {
    this.#updateSelector = updateSelector;
    this.#postWarning = postWarning;
    this.#readSelector = readSelector;
  }

  public async execute(
    request: CreateAlertRequestDto,
    auth: CreateAlertAuthDto
  ): Promise<CreateAlertResponseDto> {
    try {
      const alert: Alert = this.#createAlert();

      const readSelectorResult = await this.#readSelector.execute(
        { id: request.selectorId },
        { organizationId: auth.organizationId }
      );

      if (!readSelectorResult.success)
        throw new Error(readSelectorResult.error);

      if (!readSelectorResult.value)
        throw new Error(
          `Selector with id ${request.selectorId} does not exist`
        );

      if (readSelectorResult.value.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const alertDto = buildAlertDto(alert);

      const updateSelectorResult: Result<SelectorDto> =
        await this.#updateSelector.execute(
          {
            id: request.selectorId,
            alert: alertDto,
          },
          { organizationId: auth.organizationId }
        );

      if (!updateSelectorResult.success)
        throw new Error(updateSelectorResult.error);
      if (!updateSelectorResult.value)
        throw new Error(`Couldn't update selector ${request.selectorId}`);

      const postWarningResult: Result<WarningDto> =
        await this.#postWarning.execute(
          {
            systemId: readSelectorResult.value.systemId,
            selectorId: readSelectorResult.value.id,
          },
          { jwt: auth.jwt }
        );

      if (!postWarningResult.success) throw new Error(postWarningResult.error);
      if (!postWarningResult.value)
        throw new Error(
          `Couldn't create warning for system ${readSelectorResult.value.systemId}`
        );

      return Result.ok(alertDto);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #createAlert = (): Alert => Alert.create({});
}
