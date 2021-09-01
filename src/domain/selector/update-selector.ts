import IUseCase from '../services/use-case';
import { buildSelectorDto, SelectorDto } from './selector-dto';
import {
  ISelectorRepository,
  SelectorUpdateDto,
} from './i-selector-repository';
import Result from '../value-types/transient-types/result';
import { Alert } from '../value-types/alert';
import { AlertDto } from '../alert/alert-dto';
import { Selector } from '../entities/selector';

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
        throw new Error(`Selector with id ${request.id} does not exist`);

      const updateDto = await this.#buildUpdateDto(request);

      const updateResult = await this.#selectorRepository.updateOne(request.id, updateDto);

      if(updateResult.error) throw new Error(updateResult.error);
      
      return Result.ok<SelectorDto>(buildSelectorDto(selector)
      );
    } catch (error) {
      return Result.fail<SelectorDto>(typeof error === 'string' ? error : error.message);
    }
  }

  #buildUpdateDto = async (
    request: UpdateSelectorRequestDto
  ): Promise<SelectorUpdateDto> => {
    const updateDto: SelectorUpdateDto = {};

    if (request.content) {
      const readSelectorResult: SelectorDto[] =
        await this.#selectorRepository.findBy({ content: request.content });
      if (readSelectorResult.length)
        throw new Error(
          `Selector ${readSelectorResult[0].content} is already registered under ${readSelectorResult[0].id}`
        );

      updateDto.content = request.content;
    }

    if (request.alert) {
      const createResult = Alert.create({});
      // TODO No uniform usage of Result.value Result.error and result.success. Fix.
      if (createResult.error) throw new Error(createResult.error);
      if (!createResult.value)
        throw new Error(`Creation of selector alert ${request.alert} failed`);

      updateDto.alert = createResult.value;
    }

    updateDto.modifiedOn = Date.now();

    return updateDto;
  };
}
