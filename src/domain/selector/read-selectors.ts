import { Selector } from '../entities';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types';
import {ISelectorRepository, SelectorQueryDto } from './i-selector-repository';
import {SelectorDto, buildSelectorDto } from './selector-dto';

export interface ReadSelectorsRequestDto {
  systemId?: string;
  content?: string;
  alert?: { createdOn?: number };
  modifiedOn?: number;
}

export type ReadSelectorsResponseDto = Result<SelectorDto[] | null>;

export class ReadSelectors
  implements IUseCase<ReadSelectorsRequestDto, ReadSelectorsResponseDto>
{
  #selectorRepository: ISelectorRepository;

  public constructor(selectorRepository: ISelectorRepository) {
    this.#selectorRepository = selectorRepository;
  }

  public async execute(request: ReadSelectorsRequestDto): Promise<ReadSelectorsResponseDto> {
    try {
      const selectors: Selector[] | null =
        await this.#selectorRepository.findBy(this.#buildSelectorQueryDto(request));
      if (!selectors) throw new Error(`Queried selectors do not exist`);

      return Result.ok<SelectorDto[]>(
        selectors.map((selector) => buildSelectorDto(selector))
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }



  #buildSelectorQueryDto = (
    request: ReadSelectorsRequestDto
  ): SelectorQueryDto => 
  {

    const queryDto : SelectorQueryDto = {};

    if(request.content) queryDto.content = request.content;
    if(request.systemId) queryDto.systemId = request.systemId;
    if(request.alert && request.alert.createdOn) queryDto.alert = request.alert;
    if(request.modifiedOn) queryDto.modifiedOn = request.modifiedOn;
    
    return queryDto;
  };
}
