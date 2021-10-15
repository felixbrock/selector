import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import WarningDto from './warning-dto';
import ISystemApiRepository from './i-system-api-repository';

export interface PostWarningRequestDto {
  systemId: string;
  selectorId: string;
}

export interface PostWarningAuthDto {
  jwt: string;
}

export type PostWarningResponseDto = Result<WarningDto>;

export class PostWarning
  implements IUseCase<PostWarningRequestDto, PostWarningResponseDto, PostWarningAuthDto>
{
  #systemApiRepository: ISystemApiRepository;

  public constructor(systemApiRepository: ISystemApiRepository) {
    this.#systemApiRepository = systemApiRepository;
  }

  public async execute(
    request: PostWarningRequestDto,
    auth: PostWarningAuthDto
  ): Promise<PostWarningResponseDto> {
    try {
      const warningDto = await this.#systemApiRepository.postWarning(
        request.systemId,
        request.selectorId,
        auth.jwt
      );

      if (!warningDto)
        throw new Error(`Creation of warning for ${request.systemId} failed`);

      return Result.ok(warningDto);
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
