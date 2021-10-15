import { Selector } from '../entities/selector';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { ISelectorRepository, SelectorQueryDto } from './i-selector-repository';
import { SelectorDto, buildSelectorDto } from './selector-dto';

export interface ReadSelectorsRequestDto {
  systemId?: string;
  content?: string;
  alert?: { createdOnStart?: number; createdOnEnd?: number };
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface ReadSelectorsAuthDto {
  organizationId: string;
}

export type ReadSelectorsResponseDto = Result<SelectorDto[]>;

export class ReadSelectors
  implements
    IUseCase<
      ReadSelectorsRequestDto,
      ReadSelectorsResponseDto,
      ReadSelectorsAuthDto
    >
{
  #selectorRepository: ISelectorRepository;

  public constructor(selectorRepository: ISelectorRepository) {
    this.#selectorRepository = selectorRepository;
  }

  public async execute(
    request: ReadSelectorsRequestDto,
    auth: ReadSelectorsAuthDto
  ): Promise<ReadSelectorsResponseDto> {
    try {
      const selectors: Selector[] =
        await this.#selectorRepository.findBy(
          this.#buildSelectorQueryDto(request, auth.organizationId)
        );
      if (!selectors) throw new Error(`Queried selectors do not exist`);

      return Result.ok(
        selectors.map((selector) => buildSelectorDto(selector))
      );
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #buildSelectorQueryDto = (
    request: ReadSelectorsRequestDto,
    organizationId: string
  ): SelectorQueryDto => {
    const queryDto: SelectorQueryDto = {};

    if (request.content) queryDto.content = request.content;
    queryDto.organizationId = organizationId;
    if (request.systemId) queryDto.systemId = request.systemId;
    if (
      request.alert &&
      (request.alert.createdOnStart || request.alert.createdOnEnd)
    )
      queryDto.alert = request.alert;
    if (request.modifiedOnStart)
      queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}
