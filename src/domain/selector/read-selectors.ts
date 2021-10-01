import { Selector } from '../entities/selector';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { ISelectorRepository, SelectorQueryDto } from './i-selector-repository';
import { SelectorDto, buildSelectorDto } from './selector-dto';

export interface ReadSelectorsRequestDto {
  systemId?: string;
  content?: string;
  organizationId?: string;
  alert?: { createdOnStart?: number; createdOnEnd?: number };
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export type ReadSelectorsResponseDto = Result<SelectorDto[] | null>;

export class ReadSelectors
  implements IUseCase<ReadSelectorsRequestDto, ReadSelectorsResponseDto>
{
  #selectorRepository: ISelectorRepository;

  public constructor(selectorRepository: ISelectorRepository) {
    this.#selectorRepository = selectorRepository;
  }

  public async execute(
    request: ReadSelectorsRequestDto
  ): Promise<ReadSelectorsResponseDto> {
    try {
      const selectors: Selector[] | null =
        await this.#selectorRepository.findBy(
          this.#buildSelectorQueryDto(request)
        );
      if (!selectors) throw new Error(`Queried selectors do not exist`);

      return Result.ok<SelectorDto[]>(
        selectors.map((selector) => buildSelectorDto(selector))
      );
    } catch (error: any) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);
    }
  }

  #buildSelectorQueryDto = (
    request: ReadSelectorsRequestDto
  ): SelectorQueryDto => {
    const queryDto: SelectorQueryDto = {};

    if (request.content) queryDto.content = request.content;
    if(request.organizationId) queryDto.organizationId = request.organizationId;
    if (request.systemId) queryDto.systemId = request.systemId;
    if (request.alert && (request.alert.createdOnStart || request.alert.createdOnEnd))
      queryDto.alert = request.alert;
    if (request.modifiedOnStart) queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}
