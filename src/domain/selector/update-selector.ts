import IUseCase from '../services/use-case';
import { SelectorDto } from './selector-dto';
import {
  ISelectorRepository,
  SelectorUpdateDto,
} from './i-selector-repository';
import Result from '../value-types/transient-types/result';
import { Alert } from '../value-types/alert';
import { AlertDto } from '../alert/alert-dto';
import { ReadSelector } from './read-selector';
import { ReadSelectors, ReadSelectorsResponseDto } from './read-selectors';

// TODO - This would be a PATCH use-case since not all fields need to be necessarily updated

export interface UpdateSelectorRequestDto {
  id: string;
  content?: string;
  alert?: AlertDto;
}

export interface UpdateSelectorAuthDto {
  organizationId: string;
}

export type UpdateSelectorResponseDto = Result<SelectorDto>;

export class UpdateSelector
  implements
    IUseCase<
      UpdateSelectorRequestDto,
      UpdateSelectorResponseDto,
      UpdateSelectorAuthDto
    >
{
  #selectorRepository: ISelectorRepository;

  #readSelector: ReadSelector;

  #readSelectors: ReadSelectors;

  public constructor(
    selectorRepository: ISelectorRepository,
    readSelector: ReadSelector,
    readSelectors: ReadSelectors
  ) {
    this.#selectorRepository = selectorRepository;
    this.#readSelector = readSelector;
    this.#readSelectors = readSelectors;
  }

  public async execute(
    request: UpdateSelectorRequestDto,
    auth: UpdateSelectorAuthDto
  ): Promise<UpdateSelectorResponseDto> {
    try {
      const readSelectorResult = await this.#readSelector.execute(
        { id: request.id },
        { organizationId: auth.organizationId }
      );

      if (!readSelectorResult.success)
        throw new Error(readSelectorResult.error);

      if (!readSelectorResult.value)
        throw new Error(`Selector with id ${request.id} does not exist`);

      if (readSelectorResult.value.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const updateDto = await this.#buildUpdateDto(
        request,
        auth.organizationId
      );

      await this.#selectorRepository.updateOne(request.id, updateDto);

      return Result.ok(readSelectorResult.value);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #buildUpdateDto = async (
    request: UpdateSelectorRequestDto,
    organizationId: string
  ): Promise<SelectorUpdateDto> => {
    const updateDto: SelectorUpdateDto = {};

    if (request.content) {
      const readSelectorResult: ReadSelectorsResponseDto =
        await this.#readSelectors.execute(
          {
            content: request.content,
          },
          { organizationId }
        );

      if (!readSelectorResult.success)
        throw new Error(readSelectorResult.error);
      if (!readSelectorResult.value)
        throw new Error('Reading selectors failed');
      if (readSelectorResult.value.length)
        throw new Error(
          `Selector ${readSelectorResult.value[0].content} is already registered under ${readSelectorResult.value[0].id}`
        );

      updateDto.content = request.content;
    }

    if (request.alert) updateDto.alert = Alert.create({});

    updateDto.modifiedOn = Date.now();

    return updateDto;
  };
}
