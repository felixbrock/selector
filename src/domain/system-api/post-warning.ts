// TODO Should those really be use cases?
import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import WarningDto from './warning-dto';
import ISystemApiRepository from './i-system-api-repository';

export interface PostWarningRequestDto {
  systemId: string;
}

export type PostWarningResponseDto = Result<WarningDto | null>;

export class PostWarning
  implements IUseCase<PostWarningRequestDto, PostWarningResponseDto>
{
  #systemApiRepository: ISystemApiRepository;

  public constructor(systemApiRepository: ISystemApiRepository) {
    this.#systemApiRepository = systemApiRepository;
  }

  public async execute(
    request: PostWarningRequestDto
  ): Promise<PostWarningResponseDto> {
    try {
      const warningDto = await this.#systemApiRepository.postWarning(request.systemId);

      if (!warningDto)
        return Result.fail<null>(`Creation of warning for ${request.systemId} failed`);

      return Result.ok<WarningDto>(warningDto);
    } catch (error) {
      return Result.fail<WarningDto>(error.message);
    }
  }
}
