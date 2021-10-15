// TODO Should those really be use cases?
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import SystemDto from './system-dto';
import ISystemApiRepository from './i-system-api-repository';

export interface GetSystemRequestDto {
  id: string;
}

export interface GetSystemAuthDto {
  jwt: string;
}

export type GetSystemResponseDto = Result<SystemDto>;

export class GetSystem
  implements IUseCase<GetSystemRequestDto, GetSystemResponseDto, GetSystemAuthDto>
{
  #systemApiRepository: ISystemApiRepository;

  public constructor(systemApiRepository: ISystemApiRepository) {
    this.#systemApiRepository = systemApiRepository;
  }

  public async execute(
    request: GetSystemRequestDto,
    auth: GetSystemAuthDto
  ): Promise<GetSystemResponseDto> {
    try {
      const getSystemResult: SystemDto =
        await this.#systemApiRepository.getOne(request.id, auth.jwt);

      if (!getSystemResult)
        throw new Error(
          `No system found for id ${request.id}`
        );

      return Result.ok(getSystemResult);
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
